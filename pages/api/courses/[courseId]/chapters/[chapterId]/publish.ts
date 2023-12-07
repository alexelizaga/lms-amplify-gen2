import type { NextApiRequest, NextApiResponse } from "next";
import { getCurrentUser } from "aws-amplify/auth/server";

import { reqResBasedClient, runWithAmplifyServerContext } from "@/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "PATCH") {
    return publishChapter(req, res);
  }

  return res.status(400).json({
    message: "Bad request",
  });
}

const publishChapter = async (req: NextApiRequest, res: NextApiResponse) => {
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

    if (typeof id !== "string") {
      return res.status(400).json({
        message: "Bad request",
      });
    }

    const chapter = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: async (contextSpec) => {
        const { data: chapter } = await reqResBasedClient.models.Chapter.get(
          contextSpec,
          {
            id,
          }
        );
        return chapter;
      },
    });

    if (!chapter || !chapter.title || !chapter.description) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    if (!chapter.video && !chapter.streamUrl) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const updatedChapter = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: async (contextSpec) => {
        const { data: updatedChapter } =
          await reqResBasedClient.models.Chapter.update(contextSpec, {
            id,
            isPublished: true,
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
