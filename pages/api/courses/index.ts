import {
  reqResBasedClient,
  runWithAmplifyServerContext,
} from "@/utils/amplifyServerUtils";
import { getCurrentUser } from "aws-amplify/auth/server";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    return getCourses(req, res);
  }

  if (req.method === "POST") {
    return createCourse(req, res);
  }

  return res.status(400).json({
    message: "Bad request",
  });
}

const getCourses = async (req: NextApiRequest, res: NextApiResponse) => {
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

    const courses = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: async (contextSpec) => {
        const { data: courses } = await reqResBasedClient.models.Course.list(
          contextSpec
        );
        return courses;
      },
    });

    return res.status(200).json(courses);
  } catch (error) {
    console.log("[COURSES]", error);
    return res.status(500).json({
      message: "Internal Error",
    });
  }
};

const createCourse = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { userId } = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: (contextSpec) => getCurrentUser(contextSpec),
    });
    const { title } = await req.body;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const newCourse = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: async (contextSpec) => {
        const { data: newCourse } =
          await reqResBasedClient.models.Course.create(contextSpec, {
            title,
            userId,
          });
        return newCourse;
      },
    });

    return res.status(200).json(newCourse);
  } catch (error) {
    console.log("[COURSES]", error);
    return res.status(500).json({
      message: "Internal Error",
    });
  }
};
