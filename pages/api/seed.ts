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
    createCategories(req, res);

    return res.status(200).json({
      "Create categories": "done",
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
