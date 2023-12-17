import type { NextApiRequest, NextApiResponse } from "next";
import { getCurrentUser } from "aws-amplify/auth/server";

import { reqResBasedClient, runWithAmplifyServerContext } from "@/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "PUT") {
    return createUserProgress(req, res);
  }

  return res.status(400).json({
    message: "Bad request",
  });
}

const createUserProgress = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
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

    const { chapterId = "" } = req.query;
    const { courseId = "" } = req.query;
    const { isCompleted } = await req.body;

    if (typeof chapterId !== "string" || typeof courseId !== "string") {
      return res.status(400).json({
        message: "Bad request",
      });
    }

    const userProgress = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: async (contextSpec) => {
        const { data: userProgress } =
          await reqResBasedClient.models.UserProgress.list(contextSpec, {
            filter: {
              and: [
                { courseId: { eq: courseId } },
                { userId: { eq: userId } },
                { chapterId: { eq: chapterId } },
              ],
            },
          });
        return userProgress;
      },
    });

    if (!userProgress.length) {
      const newUserProgress = await runWithAmplifyServerContext({
        nextServerContext: { request: req, response: res },
        operation: async (contextSpec) => {
          const { data: newUserProgress } =
            await reqResBasedClient.models.UserProgress.create(contextSpec, {
              chapterId,
              userId,
              courseId,
              isCompleted,
            });
          return newUserProgress;
        },
      });
      return res.status(200).json(newUserProgress);
    }

    const updateUserProgress = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: async (contextSpec) => {
        const { data: newUserProgress } =
          await reqResBasedClient.models.UserProgress.update(contextSpec, {
            id: userProgress[0].id,
            isCompleted,
          });
        return newUserProgress;
      },
    });

    return res.status(200).json(updateUserProgress);
  } catch (error) {
    console.log("[USER_PROGRESS]", error);
    return res.status(500).json({
      message: "Internal Error",
    });
  }
};
