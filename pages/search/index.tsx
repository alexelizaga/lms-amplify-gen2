import { NextPage } from "next";
import { useRouter } from "next/router";

import {
  Categories,
  CoursesList,
  DashboardLayout,
  SearchInput,
} from "@/components";
import { CategoryValues, CourseWithProgress, UserValues } from "@/types";
import { useCategories, useCoursesWithProgress } from "@/hooks";

type Props = {
  categories: CategoryValues[];
  courses: CourseWithProgress[];
  user: UserValues;
};

const SearchPage: NextPage<Props> = ({ user: { userId } }) => {
  const router = useRouter();
  const { categoryId = "", title = "" } = router.query;

  const { categories } = useCategories();
  const { courses } = useCoursesWithProgress({
    userId,
    categoryId: `${categoryId}`,
    title: `${title}`,
  });

  return (
    <DashboardLayout title="Search" pageDescription="">
      <div className="px-6 pb-6">
        <div className="block">
          <Categories items={categories as CategoryValues[]} />
        </div>
        <div className="space-y-4">
          <SearchInput />
          <CoursesList items={courses as CourseWithProgress[]} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SearchPage;
