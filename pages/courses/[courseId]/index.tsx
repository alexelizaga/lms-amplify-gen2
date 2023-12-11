import React from "react";
import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { getCurrentUser } from "aws-amplify/auth/server";
import { Loader2 } from "lucide-react";

import { DashboardLayout } from "@/components";
import { ChapterValues, CourseValues } from "@/types";
import {
  orderByPosition,
  reqResBasedClient,
  runWithAmplifyServerContext,
} from "@/utils";

type Props = {
  course: CourseValues;
  chapters: ChapterValues[];
};

const CourseIdPage: NextPage<Props> = ({ course, chapters }) => {
  const router = useRouter();

  React.useEffect(() => {
    router.push(`/courses/${course.courseId}/chapters/${chapters[0].id}`);
  }, [chapters, course, router]);

  return (
    <DashboardLayout title={course.title} pageDescription="">
      <div className="flex items-center justify-center w-full h-full">
        <Loader2 className="animate-spin h-6 w-6 text-sky-700" />
      </div>
    </DashboardLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  params,
  req,
  res,
}) => {
  const { courseId = "" } = params as { courseId: string };
  try {
    const { userId } = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: (contextSpec) => getCurrentUser(contextSpec),
    });

    if (!userId) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

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
        if (!course.length) return undefined;
        return JSON.parse(JSON.stringify(course[0]));
      },
    });

    if (!course) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    const chapters = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: async (contextSpec) => {
        const { data: chapters } = await reqResBasedClient.models.Chapter.list(
          contextSpec,
          {
            filter: {
              and: [{ courseChaptersCourseId: { eq: courseId } }],
            },
          }
        );
        return JSON.parse(JSON.stringify(chapters.sort(orderByPosition)));
      },
    });

    return { props: { course, chapters } };
  } catch (error) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
};

export default CourseIdPage;
