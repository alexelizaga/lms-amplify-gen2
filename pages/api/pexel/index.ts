import { NextApiRequest, NextApiResponse } from "next";
import { getCurrentUser } from "aws-amplify/auth/server";
import { PhotosWithTotalResults, createClient } from "pexels";

import { runWithAmplifyServerContext } from "@/utils/amplifyServerUtils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    return getPhotos(req, res);
  }

  return res.status(400).json({
    message: "Bad request",
  });
}

const getPhotos = async (req: NextApiRequest, res: NextApiResponse) => {
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

    const { query } = req.query;

    if (typeof query !== "string") {
      return res.status(400).json({
        message: "Bad request",
      });
    }

    const client = createClient(process.env.PEXEL_SECRET!);

    const { photos } = (await client.photos.search({
      query,
      per_page: 9,
    })) as PhotosWithTotalResults;

    return res.status(200).json(photos);
  } catch (error) {
    console.log("[PEXEL]", error);
    return res.status(500).json({
      message: "Internal Error",
    });
  }
};
