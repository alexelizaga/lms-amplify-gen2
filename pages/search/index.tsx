import { GetServerSideProps, NextPage } from "next";
import { getCurrentUser } from "aws-amplify/auth/server";

import {
  Categories,
  CoursesList,
  DashboardLayout,
  SearchInput,
} from "@/components";
import { CategoryValues, CourseValues } from "@/types";
import {
  orderByTitle,
  reqResBasedClient,
  runWithAmplifyServerContext,
} from "@/utils";

type Props = {
  categories: CategoryValues[];
  courses: CourseValues[];
};

const SearchPage: NextPage<Props> = ({ categories, courses }) => {
  return (
    <DashboardLayout title="Search" pageDescription="">
      <div className="px-6 pb-16">
        <div className="mb-2 block">
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

    const categories = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: async (contextSpec) => {
        const { data: categories } =
          await reqResBasedClient.models.Category.list(contextSpec);
        return JSON.parse(JSON.stringify(categories));
      },
    });

    const courses = await runWithAmplifyServerContext({
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

    return { props: { categories, courses } };
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
