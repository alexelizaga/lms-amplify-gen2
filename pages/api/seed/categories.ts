import type { NextApiRequest, NextApiResponse } from "next";
import { getCurrentUser } from "aws-amplify/auth/server";

import {
  reqResBasedClient,
  runWithAmplifyServerContext,
} from "@/utils/amplifyServerUtils";
import { CATEGORIES } from "@/enums";

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

  seedCategories(req, res);
}

const seedCategories = async (req: NextApiRequest, res: NextApiResponse) => {
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
    res.status(200).json({ categories: CATEGORIES });
  } catch (error) {
    console.log("[SEED_CATEGORIES]", error);
    return res.status(500).json({
      message: "Internal Error",
    });
  }
};
