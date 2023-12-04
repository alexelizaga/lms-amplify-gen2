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
