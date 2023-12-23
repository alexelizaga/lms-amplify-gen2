import React from "react";
import { CheckCircle, Clock } from "lucide-react";

import { DashboardLayout, CoursesList, InfoCard } from "@/components";
import {
  CategoryValues,
  ChapterValues,
  CourseValues,
  UserProgressValues,
} from "@/types";
import { GetServerSideProps, NextPage } from "next";
import {
  orderByTitle,
  reqResBasedClient,
  runWithAmplifyServerContext,
} from "@/utils";
import { getCurrentUser } from "aws-amplify/auth/server";

type Props = {
  coursesInProgress: (CourseValues & {
    userProgress: number;
    numberOfChapters: number;
    categoryLabel: string;
  })[];
  completedCourses: (CourseValues & {
    userProgress: number;
    numberOfChapters: number;
    categoryLabel: string;
  })[];
};

const Home: NextPage<Props> = ({ coursesInProgress, completedCourses }) => {
  return (
    <DashboardLayout title="Home" pageDescription="">
      <div className="px-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoCard icon={Clock} label="In Progress" numberOfItems={0} />
          <InfoCard
            icon={CheckCircle}
            label="Completed"
            numberOfItems={0}
            variant="success"
          />
        </div>
        <CoursesList items={[...coursesInProgress, ...completedCourses]} />
      </div>
    </DashboardLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  query,
}) => {
  try {
    const { userId } = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: (contextSpec) => getCurrentUser(contextSpec),
    });

    if (!userId) {
      return {
        props: {
          coursesInProgress: [],
          completedCourses: [],
        },
      };
    }

    const { title = "", categoryId = "" } = query;

    if (typeof title !== "string" || typeof categoryId !== "string") {
      return {
        props: {
          coursesInProgress: [],
          completedCourses: [],
        },
      };
    }

    const categories: CategoryValues[] = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: async (contextSpec) => {
        const { data: categories } =
          await reqResBasedClient.models.Category.list(contextSpec);
        return JSON.parse(JSON.stringify(categories));
      },
    });

    const courses: CourseValues[] = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: async (contextSpec) => {
        const { data: courses } = await reqResBasedClient.models.Course.list(
          contextSpec,
          {
            filter: {
              and: [
                { categoryCoursesId: { contains: categoryId } },
                { title: { contains: title } },
                { isPublished: { eq: "true" } },
              ],
            },
          }
        );
        return JSON.parse(JSON.stringify(courses.sort(orderByTitle)));
      },
    });

    const userProgress: UserProgressValues[] =
      await runWithAmplifyServerContext({
        nextServerContext: { request: req, response: res },
        operation: async (contextSpec) => {
          const { data: usersProgress } =
            await reqResBasedClient.models.UserProgress.list(contextSpec, {
              filter: {
                and: [{ userId: { eq: userId } }],
              },
            });
          return JSON.parse(JSON.stringify(usersProgress));
        },
      });

    const chapters: ChapterValues[] = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: async (contextSpec) => {
        const { data: chapters } = await reqResBasedClient.models.Chapter.list(
          contextSpec
        );
        return JSON.parse(JSON.stringify(chapters));
      },
    });

    const getCategory = (categoryId: string | undefined): string => {
      if (!categoryId) return "";
      return (
        categories.find((category) => category.id === categoryId)?.name ?? ""
      );
    };

    const coursesWithProgress = courses.map((course) => {
      const chaptersCompleted = userProgress.filter(
        (progress) =>
          progress.courseId === course.courseId && progress.isCompleted
      ).length;

      const numberOfChapters = chapters.filter(
        (chapter) => chapter.courseChaptersCourseId === course.courseId
      ).length;

      return {
        ...course,
        userProgress: (chaptersCompleted / numberOfChapters) * 100,
        numberOfChapters: numberOfChapters,
        categoryLabel: getCategory(course.categoryCoursesId),
      };
    });

    return {
      props: {
        coursesInProgress: coursesWithProgress.filter(
          (course) => course?.userProgress !== 0 && course?.userProgress !== 100
        ),
        completedCourses: coursesWithProgress.filter(
          (course) => course?.userProgress === 100
        ),
      },
    };
  } catch (error) {
    return {
      props: {
        coursesInProgress: [],
        completedCourses: [],
      },
    };
  }
};

export default Home;
