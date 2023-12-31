import { NextApiRequest, NextApiResponse } from "next";
import { getCurrentUser } from "aws-amplify/auth/server";

import { reqResBasedClient, runWithAmplifyServerContext } from "@/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "PATCH") {
    return updateCourse(req, res);
  }

  if (req.method === "DELETE") {
    return deleteCourse(req, res);
  }

  return res.status(400).json({
    message: "Bad request",
  });
}

const updateCourse = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { userId } = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: (contextSpec) => getCurrentUser(contextSpec),
    });
    const { courseId } = req.query;
    const values = await req.body;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const updatedCourse = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: async (contextSpec) => {
        const { data: updateCourse } =
          await reqResBasedClient.models.Course.update(contextSpec, {
            id: courseId,
            ...values,
          });
        return updateCourse;
      },
    });
    return res.status(200).json(updatedCourse);
  } catch (error) {
    console.log("[COURSE_ID]", error);
    return res.status(500).json({
      message: "Internal Error",
    });
  }
};

const deleteCourse = async (req: NextApiRequest, res: NextApiResponse) => {
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

    const { courseId } = req.query;

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
                { courseChaptersId: { eq: courseId } },
                { owner: { eq: userId } },
              ],
            },
          }
        );
        return chapters;
      },
    });

    if (!!chapters.length) {
      return res.status(404).json({
        message: "Course have chapters",
      });
    }

    const deletedCourse = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: async (contextSpec) => {
        const { data: deleteCourse } =
          await reqResBasedClient.models.Course.delete(contextSpec, {
            id: courseId,
          });
        return deleteCourse;
      },
    });

    return res.status(200).json(deletedCourse);
  } catch (error) {
    console.log("[COURSE_ID]", error);
    return res.status(500).json({
      message: "Internal Error",
    });
  }
};
