import type { NextApiRequest, NextApiResponse } from "next";
import { getCurrentUser } from "aws-amplify/auth/server";

import { reqResBasedClient, runWithAmplifyServerContext } from "@/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "PATCH") {
    return publishCourse(req, res);
  }

  return res.status(400).json({
    message: "Bad request",
  });
}

const publishCourse = async (req: NextApiRequest, res: NextApiResponse) => {
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

    const { courseId = "" } = req.query;

    if (typeof courseId !== "string") {
      return res.status(400).json({
        message: "Bad request",
      });
    }

    const updatedCourse = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: async (contextSpec) => {
        const { data: updatedCourse } =
          await reqResBasedClient.models.Course.update(contextSpec, {
            id: courseId,
            isPublished: true,
          });
        return updatedCourse;
      },
    });

    return res.status(200).json(updatedCourse);
  } catch (error) {
    console.log("[PUBLISH]", error);
    return res.status(500).json({
      message: "Internal Error",
    });
  }
};
