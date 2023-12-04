import type { NextApiRequest, NextApiResponse } from "next";
import { getCurrentUser } from "aws-amplify/auth/server";

import { reqResBasedClient, runWithAmplifyServerContext } from "@/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    return getChapters(req, res);
  }

  if (req.method === "POST") {
    return createChapter(req, res);
  }

  return res.status(400).json({
    message: "Bad request",
  });
}

const getChapters = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { userId } = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: (contextSpec) => getCurrentUser(contextSpec),
    });
    const { courseId } = req.query;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (typeof courseId !== "string") {
      return res.status(400).json({
        message: "Bad request",
      });
    }

    const chapters = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: async (contextSpec) => {
        const { data: chapters } = await reqResBasedClient.models.Chapter.list(
          contextSpec,
          {
            filter: {
              and: [
                { courseChaptersCourseId: { eq: courseId } },
                { courseChaptersUserId: { eq: userId } },
              ],
            },
          }
        );
        return chapters;
      },
    });

    return res.status(200).json(chapters);
  } catch (error) {
    console.log("[COURSES]", error);
    return res.status(500).json({
      message: "Internal Error",
    });
  }
};

const createChapter = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { userId } = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: (contextSpec) => getCurrentUser(contextSpec),
    });
    const { courseId } = req.query;
    const { title } = await req.body;
    const { position } = await req.body;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (typeof courseId !== "string") {
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

    const newChapter = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: async (contextSpec) => {
        const { data: newChapter } =
          await reqResBasedClient.models.Chapter.create(contextSpec, {
            title,
            position,
            courseChaptersCourseId: courseId,
            courseChaptersUserId: userId,
          });
        return newChapter;
      },
    });

    return res.status(200).json(newChapter);
  } catch (error) {
    console.log("[COURSES]", error);
    return res.status(500).json({
      message: "Internal Error",
    });
  }
};
