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
    restartCourses(req, res);
    restartCategories(req, res);
    restartChapters(req, res);

    return res.status(200).json({
      "Restart courses": "done",
      "Restart chapters": "done",
      "Restart categories": "done",
    });
  }

  return res.status(400).json({
    message: "Bad request",
  });
}

const CATEGORIES = [
  { name: "Computer Science", icon: "FcEngineering" },
  { name: "Music", icon: "FcMusic" },
  { name: "Fitness", icon: "FcSportsMode" },
  { name: "Photography", icon: "FcOldTimeCamera" },
  { name: "Filming", icon: "FcFilmReel" },
];

const restartCategories = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const categories = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: async (contextSpec) => {
        const { data: categories } =
          await reqResBasedClient.models.Category.list(contextSpec);
        return categories;
      },
    });

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

    createCategories(req, res);
  } catch (error) {
    console.log("[SEED_CATEGORIES]", error);
    return res.status(500).json({
      message: "Internal Error",
    });
  }
};

const createCategories = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    CATEGORIES.forEach(async ({ name, icon }) => {
      await runWithAmplifyServerContext({
        nextServerContext: { request: req, response: res },
        operation: async (contextSpec) => {
          await reqResBasedClient.models.Category.create(contextSpec, {
            name,
            icon,
          });
        },
      });
    });
  } catch (error) {
    console.log("[SEED_CATEGORIES]", error);
    return res.status(500).json({
      message: "Internal Error",
    });
  }
};

const restartCourses = async (req: NextApiRequest, res: NextApiResponse) => {
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
  } catch (error) {
    console.log("[SEED_COURSES]", error);
    return res.status(500).json({
      message: "Internal Error",
    });
  }
};

const restartChapters = async (req: NextApiRequest, res: NextApiResponse) => {
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
  } catch (error) {
    console.log("[SEED_CHAPTERS]", error);
    return res.status(500).json({
      message: "Internal Error",
    });
  }
};
