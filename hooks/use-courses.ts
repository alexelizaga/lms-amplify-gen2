import useSWR from "swr";
import { generateClient } from "aws-amplify/api";

import { Schema } from "@/amplify/data/resource";

import { useCategories, useChapters, useUserProgress } from "./";

const client = generateClient<Schema>();

export const useCourses = (query?: {}) => {
  const fetcher = () =>
    client.models.Course.list(query).then((res) => res.data);

  const { data, error, isLoading } = useSWR(
    query ? JSON.stringify(query) : `/api/courses`,
    fetcher
  );

  return {
    courses: data,
    isLoading,
    isError: error,
  };
};

export const useCoursesWithProgress = ({
  userId,
  categoryId = "",
  title = "",
}: {
  userId: string;
  categoryId?: string;
  title?: string;
}) => {
  const { courses } = useCourses({
    filter: {
      and: [
        { isPublished: { eq: "true" } },
        { categoryCoursesId: { contains: categoryId } },
        { title: { contains: title } },
      ],
    },
  });

  const { progress: userProgress } = useUserProgress({
    filter: {
      and: [{ userId: { eq: userId } }],
    },
  });

  const { chapters } = useChapters();

  const { categories } = useCategories();

  const getCategory = (categoryId: string | undefined): string => {
    if (!categoryId) return "";
    return (
      categories?.find((category) => category.id === categoryId)?.name ?? ""
    );
  };

  const coursesWithProgress = courses?.map((course) => {
    const chaptersCompleted =
      userProgress?.filter(
        (progress) =>
          progress.courseId === course.courseId && progress.isCompleted
      ).length || 0;

    const numberOfChapters =
      chapters?.filter(
        (chapter) => chapter.courseChaptersCourseId === course.courseId
      ).length || 0;

    return {
      ...course,
      userProgress: (chaptersCompleted / numberOfChapters) * 100,
      numberOfChapters: numberOfChapters,
      categoryLabel: getCategory(course.categoryCoursesId),
    };
  });

  return {
    courses: coursesWithProgress,
  };
};
