// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { runWithAmplifyServerContext } from "@/utils/amplifyServerUtils";
import { AuthUser } from "aws-amplify/auth";
import { getCurrentUser } from "aws-amplify/auth/server";
import type { NextApiRequest, NextApiResponse } from "next";

interface Data extends AuthUser {}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const currentUser = await runWithAmplifyServerContext({
    nextServerContext: { request: req, response: res },
    operation: (contextSpec) => getCurrentUser(contextSpec),
  });

  res.status(200).json(currentUser);
}
