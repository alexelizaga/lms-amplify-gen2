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
              and: [{ courseChaptersId: { eq: courseId } }],
            },
          }
        );
        return chapters;
      },
    });

    return res.status(200).json(chapters);
  } catch (error) {
    console.log("[CHAPTERS]", error);
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

    const newChapter = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: async (contextSpec) => {
        const { data: newChapter } =
          await reqResBasedClient.models.Chapter.create(contextSpec, {
            title,
            position,
            course,
          });
        return newChapter;
      },
    });

    return res.status(200).json(newChapter);
  } catch (error) {
    console.log("[CHAPTERS]", error);
    return res.status(500).json({
      message: "Internal Error",
    });
  }
};
