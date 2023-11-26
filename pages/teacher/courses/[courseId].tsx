import React from "react";

import { GetServerSideProps, NextPage } from "next";
import {
  reqResBasedClient,
  runWithAmplifyServerContext,
} from "@/utils/amplifyServerUtils";
import { getCurrentUser } from "aws-amplify/auth/server";

type Props = {
  course: any;
};

const CourseIdPage: NextPage<Props> = ({ course }) => {
  return (
    <div>
      <div>CourseId: {course?.courseId}</div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  params,
  req,
  res,
}) => {
  const { courseId = "" } = params as { courseId: string };

  const { userId } = await runWithAmplifyServerContext({
    nextServerContext: { request: req, response: res },
    operation: (contextSpec) => getCurrentUser(contextSpec),
  });

  const course = await runWithAmplifyServerContext({
    nextServerContext: { request: req, response: res },
    operation: async (contextSpec) => {
      const { data: course } = await reqResBasedClient.models.Course.list(
        contextSpec,
        {
          filter: {
            and: [{ courseId: { eq: courseId } }, { userId: { eq: userId } }],
          },
        }
      );
      return JSON.parse(JSON.stringify(course[0]));
    },
  });

  return { props: { course } };
};

export default CourseIdPage;
