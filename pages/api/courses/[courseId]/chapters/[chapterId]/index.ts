import type { NextApiRequest, NextApiResponse } from "next";
import { getCurrentUser } from "aws-amplify/auth/server";

import { reqResBasedClient, runWithAmplifyServerContext } from "@/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "PATCH") {
    return updateChapter(req, res);
  }

  if (req.method === "DELETE") {
    return deleteChapter(req, res);
  }

  return res.status(400).json({
    message: "Bad request",
  });
}

const updateChapter = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { userId } = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: (contextSpec) => getCurrentUser(contextSpec),
    });
    const { chapterId: id = "" } = req.query;
    const values = await req.body;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const updatedChapter = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: async (contextSpec) => {
        const { data: updatedChapter } =
          await reqResBasedClient.models.Chapter.update(contextSpec, {
            id,
            ...values,
          });
        return updatedChapter;
      },
    });

    return res.status(200).json(updatedChapter);
  } catch (error) {
    console.log("[COURSE_ID]", error);
    return res.status(500).json({
      message: "Internal Error",
    });
  }
};

const deleteChapter = async (req: NextApiRequest, res: NextApiResponse) => {
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

    const { chapterId: id = "" } = req.query;
    const { courseId = "" } = req.query;

    if (typeof id !== "string" || typeof courseId !== "string") {
      return res.status(400).json({
        message: "Bad request",
      });
    }

    const courses = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: async (contextSpec) => {
        const { data: courses } = await reqResBasedClient.models.Course.list(
          contextSpec
        );
        return courses;
      },
    });

    const courseOwner = courses.find(
      (course) => course.userId === userId && course.courseId === courseId
    );

    if (!courseOwner) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const deleteChapter = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: async (contextSpec) => {
        const { data: deleteChapter } =
          await reqResBasedClient.models.Chapter.delete(contextSpec, {
            id,
          });
        return deleteChapter;
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
              userId,
              courseId,
              isPublished: false,
            });
          return updateCourse;
        },
      });
    }

    return res.status(200).json(deleteChapter);
  } catch (error) {
    console.log("[COURSE_ID]", error);
    return res.status(500).json({
      message: "Internal Error",
    });
  }
};
