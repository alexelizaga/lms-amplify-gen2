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

  deleteCategories(req, res);
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

    if (!categories.length) {
      return res.status(200).json({ "deleted items": 0, categories: [] });
    }

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

    return res
      .status(200)
      .json({ "deleted items": categories.length, categories });
  } catch (error) {
    console.log("[DELETE_CATEGORIES]", error);
    return res.status(500).json({
      message: "Internal Error",
    });
  }
};
