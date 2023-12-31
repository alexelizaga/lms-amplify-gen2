import { GetServerSideProps, NextPage } from "next";
import Link from "next/link";
import { getCurrentUser } from "aws-amplify/auth/server";
import { Button, Heading } from "@aws-amplify/ui-react";
import { FolderPlus, PlusCircle } from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  reqResBasedClient,
  runWithAmplifyServerContext,
  orderByTitle,
  goHome,
} from "@/utils";
import { CourseValues } from "@/types";
import { CoursesTable } from "@/components";

type Props = {
  userCourses: CourseValues[];
};

const CoursesPage: NextPage<Props> = ({ userCourses }) => {
  return (
    <DashboardLayout title="Teacher - Courses" pageDescription="">
      <div className="h-full pb-6 flex flex-col">
        {!!userCourses.length && (
          <div className="px-6">
            <div className="flex justify-start gap-3 mb-6">
              <Heading alignSelf={"baseline"} marginBottom={0} level={3}>
                My courses
              </Heading>
              <Link className="self-baseline" href="/teacher/create">
                <Button variation="link" size="small">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Course
                </Button>
              </Link>
            </div>
            <CoursesTable data={userCourses} />
          </div>
        )}
        {!userCourses.length && (
          <div className="h-full flex flex-col justify-center items-center gap-3">
            <div className="flex flex-col justify-center items-center">
              <FolderPlus size={50} className="mr-6" />
              <h1 className="text-2xl">Creating your first course</h1>
            </div>
            <div>
              <Link className="self-baseline" href="/teacher/create">
                <Button variation="link" size="small">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Course
                </Button>
              </Link>
            </div>
          </div>
        )}
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

    if (!userId) return goHome();

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
