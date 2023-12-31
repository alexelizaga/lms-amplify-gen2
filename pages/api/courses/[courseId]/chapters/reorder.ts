import type { NextApiRequest, NextApiResponse } from "next";
import { getCurrentUser } from "aws-amplify/auth/server";

import { reqResBasedClient, runWithAmplifyServerContext } from "@/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "PUT") {
    return reorderChapters(req, res);
  }

  return res.status(400).json({
    message: "Bad request",
  });
}

const reorderChapters = async (req: NextApiRequest, res: NextApiResponse) => {
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

    const { list } = await req.body;
    const { courseId } = req.query;

    if (typeof courseId !== "string") {
      return res.status(400).json({
        message: "Bad request",
      });
    }

    const courses = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: async (contextSpec) => {
        const { data: courses } = await reqResBasedClient.models.Course.get(
          contextSpec,
          {
            id: courseId,
          }
        );
        return courses;
      },
    });

    const courseOwner = courses.userId === userId;

    if (!courseOwner) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    for (let item of list) {
      await runWithAmplifyServerContext({
        nextServerContext: { request: req, response: res },
        operation: async (contextSpec) => {
          const { data: updateChapter } =
            await reqResBasedClient.models.Chapter.update(contextSpec, {
              id: item.id,
              position: item.position,
            });
          return updateChapter;
        },
      });
    }

    return res.status(200).json("Success");
  } catch (error) {
    console.log("[COURSES]", error);
    return res.status(500).json({
      message: "Internal Error",
    });
  }
};
