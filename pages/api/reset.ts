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

  if (req.method === "GET") {
    deleteUsersProgress(req, res);
    deleteChapters(req, res);
    deleteCourses(req, res);
    deleteCategories(req, res);

    return res.status(200).json({
      "Delete users progress": "done",
      "Delete chapters": "done",
      "Delete courses": "done",
      "Delete categories": "done",
    });
  }

  return res.status(400).json({
    message: "Bad request",
  });
}

const deleteCategories = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const categories = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: async (contextSpec) => {
        const { data: categories } =
          await reqResBasedClient.models.Category.list(contextSpec);
        return categories;
      },
    });

    console.log("delete", { categories });

    categories.forEach(async (category) => {
      await runWithAmplifyServerContext({
        nextServerContext: { request: req, response: res },
        operation: async (contextSpec) => {
          await reqResBasedClient.models.Category.delete(contextSpec, {
            id: category.id,
          });
        },
      });
    });
  } catch (error) {
    console.log("[DELETE_CATEGORIES]", error);
    return res.status(500).json({
      message: "Internal Error",
    });
  }
};

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

    console.log("delete", { courses });

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
  } catch (error) {
    console.log("[DELETE_COURSES]", error);
    return res.status(500).json({
      message: "Internal Error",
    });
  }
};

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

    console.log("delete", { chapters });

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
  } catch (error) {
    console.log("[DELETE_CHAPTERS]", error);
    return res.status(500).json({
      message: "Internal Error",
    });
  }
};

const deleteUsersProgress = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  try {
    const usersProgress = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: async (contextSpec) => {
        const { data: usersProgress } =
          await reqResBasedClient.models.UserProgress.list(contextSpec);
        return usersProgress;
      },
    });

    console.log("delete", { usersProgress });

    usersProgress.forEach(async ({ id }) => {
      await runWithAmplifyServerContext({
        nextServerContext: { request: req, response: res },
        operation: async (contextSpec) => {
          await reqResBasedClient.models.UserProgress.delete(contextSpec, {
            id,
          });
        },
      });
    });
  } catch (error) {
    console.log("[DELETE_USER_PROGRESS]", error);
    return res.status(500).json({
      message: "Internal Error",
    });
  }
};
