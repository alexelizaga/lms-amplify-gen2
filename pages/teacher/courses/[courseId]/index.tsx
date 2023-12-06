import React from "react";
import { GetServerSideProps, NextPage } from "next";
import { getCurrentUser } from "aws-amplify/auth/server";
import { CircleDollarSign, LayoutDashboard, ListChecks } from "lucide-react";

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
} from "@/components";
import { CategoryValues, ChapterValues, CourseValues } from "@/types";

type Props = {
  course: CourseValues;
  chapters: ChapterValues[];
  categories: CategoryValues[];
};

const CourseIdPage: NextPage<Props> = ({ course, categories, chapters }) => {
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
    course.price,
    course.categoryCoursesId,
    chapters.some((chapter) => chapter.isPublished),
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;

  const completionText = `(${completedFields}/${totalFields})`;

  return (
    <DashboardLayout title={course.title} pageDescription="">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-2xl font-medium">Course setup</h1>
            <span className="text-sm text-slate-700">
              Complete all fields {completionText}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          <div>
            <div className="flex items-center gap-x-3.5">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-xl">Customize your course</h2>
            </div>
            <TitleForm initialData={course} />
            <DescriptionForm initialData={course} />
            {/* <ImageForm initialData={course} onSubmit={onSubmit} /> */}
            <ImageUrlForm initialData={course} />
            <CategoryForm initialData={course} options={categoryOptions} />
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={ListChecks} />
                <h2 className="text-xl">Course chapters</h2>
              </div>
              <ChaptersForm initialData={course} />
            </div>
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={CircleDollarSign} />
                <h2 className="text-xl">Sell your course</h2>
              </div>
              <PriceForm initialData={course} />
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
      const { data: categories } = await reqResBasedClient.models.Category.list(
        contextSpec
      );
      return JSON.parse(JSON.stringify(categories));
    },
  });

  return { props: { course, categories, chapters } };
};

export default CourseIdPage;
