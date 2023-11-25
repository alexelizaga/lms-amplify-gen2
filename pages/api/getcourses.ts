import {
  reqResBasedClient,
  runWithAmplifyServerContext,
} from "@/utils/amplifyServerUtils";
import { getCurrentUser } from "aws-amplify/auth/server";
import type { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";

export default async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId } = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: (contextSpec) => getCurrentUser(contextSpec),
    });

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
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
    return new NextResponse("Internal Error", { status: 500 });
  }
}
