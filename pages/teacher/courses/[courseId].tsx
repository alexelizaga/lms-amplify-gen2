import React from "react";
import { GetServerSideProps, NextPage } from "next";
import {
  reqResBasedClient,
  runWithAmplifyServerContext,
} from "@/utils/amplifyServerUtils";
import { getCurrentUser } from "aws-amplify/auth/server";
import { CircleDollarSign, LayoutDashboard, ListChecks } from "lucide-react";

import {
  IconBadge,
  DashboardLayout,
  TitleForm,
  DescriptionForm,
  PriceForm,
  CategoryForm,
} from "@/components";
import { CategoryValues, CourseValues } from "@/types";
import ImageUrlForm from "@/components/dashboard/teacher/course/image-url-form";

type Props = {
  course: CourseValues;
  categories: CategoryValues[];
};

const CourseIdPage: NextPage<Props> = ({ course, categories }) => {
  const categoryOptions = React.useMemo(() => {
    return categories?.map((category) => ({
      label: category.name,
      id: category.id,
    }));
  }, [categories]);

  const requiredFields = [
    course.title,
    course.description,
    course.image,
    course.price,
    course.categoryCoursesId,
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
              {/* <ChaptersForm initialData={course} onSubmit={onSubmitChapter} /> */}
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

  const categories = await runWithAmplifyServerContext({
    nextServerContext: { request: req, response: res },
    operation: async (contextSpec) => {
      const { data: categories } = await reqResBasedClient.models.Category.list(
        contextSpec
      );
      return JSON.parse(JSON.stringify(categories));
    },
  });

  return { props: { course, categories } };
};

export default CourseIdPage;
