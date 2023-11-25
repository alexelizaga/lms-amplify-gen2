import {
  reqResBasedClient,
  runWithAmplifyServerContext,
} from "@/utils/amplifyServerUtils";
import { getCurrentUser } from "aws-amplify/auth/server";
import type { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId } = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: (contextSpec) => getCurrentUser(contextSpec),
    });
    const { title } = await req.body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
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
    return new NextResponse("Internal Error", { status: 500 });
  }
}
