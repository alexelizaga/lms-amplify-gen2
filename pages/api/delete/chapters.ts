import type { NextApiRequest, NextApiResponse } from "next";
import { getCurrentUser } from "aws-amplify/auth/server";

import {
  reqResBasedClient,
  runWithAmplifyServerContext,
} from "@/utils/amplifyServerUtils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId } = await runWithAmplifyServerContext({
    nextServerContext: { request: req, response: res },
    operation: (contextSpec) => getCurrentUser(contextSpec),
  });

  if (!userId) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  if (req.method !== "GET") {
    return res.status(400).json({
      message: "Bad request",
    });
  }

  deleteChapters(req, res);
}

const deleteChapters = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const chapters = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: async (contextSpec) => {
        const { data: chapters } = await reqResBasedClient.models.Chapter.list(
          contextSpec
        );
        return chapters;
      },
    });

    chapters.forEach(async ({ id }) => {
      await runWithAmplifyServerContext({
        nextServerContext: { request: req, response: res },
        operation: async (contextSpec) => {
          await reqResBasedClient.models.Chapter.delete(contextSpec, {
            id,
          });
        },
      });
    });

    return res.status(200).json({ chapters });
  } catch (error) {
    console.log("[DELETE_CHAPTERS]", error);
    return res.status(500).json({
      message: "Internal Error",
    });
  }
};
