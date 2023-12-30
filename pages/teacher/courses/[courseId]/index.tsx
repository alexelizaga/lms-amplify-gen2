import React from "react";
import { GetServerSideProps, NextPage } from "next";
import { getCurrentUser } from "aws-amplify/auth/server";
import {
  ArrowLeft,
  CircleDollarSign,
  LayoutDashboard,
  ListChecks,
} from "lucide-react";

import { reqResBasedClient, runWithAmplifyServerContext } from "@/utils";
import {
  IconBadge,
  DashboardLayout,
  TitleForm,
  DescriptionForm,
  PriceForm,
  CategoryForm,
  ChaptersForm,
  ImageUrlForm,
  Actions,
} from "@/components";
import { CategoryValues, ChapterValues, CourseValues } from "@/types";
import { Alert, View, useTheme } from "@aws-amplify/ui-react";
import Link from "next/link";

type Props = {
  course: CourseValues;
  chapters: ChapterValues[];
  categories: CategoryValues[];
};

const CourseIdPage: NextPage<Props> = ({ course, categories, chapters }) => {
  const { tokens } = useTheme();
  const categoryOptions = React.useMemo(() => {
    return categories?.map((category) => ({
      label: category.name,
      id: category.id,
    }));
  }, [categories]);

  const requiredFields = [
    course.title,
    course.description,
    course.image || course.imageUrl,
    course.price !== null,
    course.categoryCoursesId,
    chapters.some((chapter) => chapter.isPublished),
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;

  const completionText = `(${completedFields}/${totalFields})`;

  const isComplete = requiredFields.every(Boolean);

  return (
    <DashboardLayout title={course.title} pageDescription="">
      <div className="px-6 pb-16">
        {!course.isPublished ? (
          <div className="mb-6">
            <Alert
              variation="warning"
              isDismissible={false}
              hasIcon={true}
              heading="Alert"
            >
              This course is unpublished. It will not be visible to the
              students.
            </Alert>
          </div>
        ) : (
          <></>
        )}
        <div className="flex items-center justify-between">
          <div className="w-full">
            <Link
              href={`/teacher/courses`}
              className="flex items-center text-sm hover:opacity-75 transition mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to courses
            </Link>
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col gap-y-2">
                <h1 className="text-2xl font-medium">Course setup</h1>
                <View color={tokens.colors.primary[30]} className="text-sm">
                  Complete all fields {completionText}
                </View>
              </div>
              <Actions
                disabled={!isComplete}
                courseId={course.courseId}
                isPublished={course.isPublished ?? false}
                hasChapters={!!chapters.length}
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-x-3.5">
                <IconBadge icon={LayoutDashboard} />
                <h2 className="text-xl">Customize your course</h2>
              </div>
              <TitleForm initialData={course} />
              <CategoryForm initialData={course} options={categoryOptions} />
              <DescriptionForm initialData={course} />
              <ImageUrlForm initialData={course} />
            </div>
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={CircleDollarSign} />
                <h2 className="text-xl">Sell your course</h2>
              </div>
              <PriceForm initialData={course} />
            </div>
          </div>

          <div>
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={ListChecks} />
                <h2 className="text-xl">Course chapters</h2>
              </div>
              <ChaptersForm initialData={course} />
            </div>
          </div>
        </div>
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
              and: [
                { courseChaptersCourseId: { eq: courseId } },
                { courseChaptersUserId: { eq: userId } },
              ],
            },
          }
        );
        return JSON.parse(JSON.stringify(chapters));
      },
    });

    const categories = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: async (contextSpec) => {
        const { data: categories } =
          await reqResBasedClient.models.Category.list(contextSpec);
        return JSON.parse(JSON.stringify(categories));
      },
    });

    return { props: { course, categories, chapters } };
  } catch (error) {
    return {
      redirect: {
        destination: "/teacher/courses",
        permanent: false,
      },
    };
  }
};

export default CourseIdPage;
