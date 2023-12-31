import type { NextApiRequest, NextApiResponse } from "next";
import { getCurrentUser } from "aws-amplify/auth/server";

import { reqResBasedClient, runWithAmplifyServerContext } from "@/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "PATCH") {
    return unpublishChapter(req, res);
  }

  return res.status(400).json({
    message: "Bad request",
  });
}

const unpublishChapter = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { userId } = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: (contextSpec) => getCurrentUser(contextSpec),
    });

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { chapterId: id = "", courseId = "" } = req.query;

    if (typeof id !== "string" || typeof courseId !== "string") {
      return res.status(400).json({
        message: "Bad request",
      });
    }

    const course = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: async (contextSpec) => {
        const { data: course } = await reqResBasedClient.models.Course.get(
          contextSpec,
          {
            id: courseId,
          }
        );
        return course;
      },
    });

    const courseOwner = course.userId === userId;

    if (!courseOwner) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const unpublishedChapter = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: async (contextSpec) => {
        const { data: updatedChapter } =
          await reqResBasedClient.models.Chapter.update(contextSpec, {
            id,
            isPublished: false,
          });
        return updatedChapter;
      },
    });

    const publishedChaptersInCourse = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: async (contextSpec) => {
        const { data: courses } = await reqResBasedClient.models.Chapter.list(
          contextSpec,
          {
            filter: {
              isPublished: {
                eq: "true",
              },
            },
          }
        );
        return courses;
      },
    });

    if (!publishedChaptersInCourse.length) {
      await runWithAmplifyServerContext({
        nextServerContext: { request: req, response: res },
        operation: async (contextSpec) => {
          const { data: updateCourse } =
            await reqResBasedClient.models.Course.update(contextSpec, {
              id: courseId,
              isPublished: false,
            });
          return updateCourse;
        },
      });
    }

    return res.status(200).json(unpublishedChapter);
  } catch (error) {
    console.log("[UNPUBLISH]", error);
    return res.status(500).json({
      message: "Internal Error",
    });
  }
};
