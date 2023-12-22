import { GetServerSideProps, NextPage } from "next";
import { getCurrentUser } from "aws-amplify/auth/server";

import {
  Categories,
  CoursesList,
  DashboardLayout,
  SearchInput,
} from "@/components";
import {
  CategoryValues,
  ChapterValues,
  CourseValues,
  UserProgressValues,
} from "@/types";
import {
  orderByTitle,
  reqResBasedClient,
  runWithAmplifyServerContext,
} from "@/utils";

type Props = {
  categories: CategoryValues[];
  courses: (CourseValues & {
    userProgress: number;
    numberOfChapters: number;
    categoryLabel: string;
  })[];
};

const SearchPage: NextPage<Props> = ({ categories, courses }) => {
  return (
    <DashboardLayout title="Search" pageDescription="">
      <div className="px-6 pb-6">
        <div className="block">
          <Categories items={categories} />
        </div>
        <div className="space-y-4">
          <SearchInput />
          <CoursesList items={courses} />
        </div>
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
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    const { title = "", categoryId = "" } = query;

    if (typeof title !== "string" || typeof categoryId !== "string") {
      return {
        redirect: {
          destination: "/",
          permanent: false,
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

    return { props: { categories, courses: coursesWithProgress } };
  } catch (error) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
};

export default SearchPage;
