import { GetServerSideProps, NextPage } from "next";
import Link from "next/link";
import { getCurrentUser } from "aws-amplify/auth/server";
import { Button, Heading } from "@aws-amplify/ui-react";
import { PlusCircle } from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  reqResBasedClient,
  runWithAmplifyServerContext,
  orderByTitle,
} from "@/utils";
import { CourseValues } from "@/types";
import { CoursesTable } from "@/components";

type Props = {
  userCourses: CourseValues[];
};

const CoursesPage: NextPage<Props> = ({ userCourses }) => {
  return (
    <DashboardLayout title="Teacher - Courses" pageDescription="">
      <div className="px-6 pb-16">
        <Heading marginBottom={16} level={3}>
          My courses
        </Heading>
        <div className="flex justify-end mb-6">
          <Link href="/teacher/create">
            <Button variation="link" size="small">
              <PlusCircle className="h-4 w-4 mr-2" />
              New Course
            </Button>
          </Link>
        </div>
        <CoursesTable data={userCourses} />
      </div>
    </DashboardLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
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

    const userCourses = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: async (contextSpec) => {
        const { data: courses } = await reqResBasedClient.models.Course.list(
          contextSpec,
          {
            filter: {
              and: [{ userId: { eq: userId } }],
            },
          }
        );
        return JSON.parse(JSON.stringify(courses.sort(orderByTitle)));
      },
    });

    return { props: { userCourses } };
  } catch (error) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
};

export default CoursesPage;
