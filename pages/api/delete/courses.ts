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

  deleteCourses(req, res);
}

const deleteCourses = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const courses = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: async (contextSpec) => {
        const { data: courses } = await reqResBasedClient.models.Course.list(
          contextSpec
        );
        return courses;
      },
    });

    courses.forEach(async ({ courseId, userId }) => {
      await runWithAmplifyServerContext({
        nextServerContext: { request: req, response: res },
        operation: async (contextSpec) => {
          await reqResBasedClient.models.Course.delete(contextSpec, {
            courseId,
            userId,
          });
        },
      });
    });

    return res.status(200).json({ courses });
  } catch (error) {
    console.log("[DELETE_COURSES]", error);
    return res.status(500).json({
      message: "Internal Error",
    });
  }
};
