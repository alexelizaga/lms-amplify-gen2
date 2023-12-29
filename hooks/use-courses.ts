import { useQuery } from "react-query";
import { useQueryClient } from "react-query";
import { generateClient } from "aws-amplify/api";

import { Schema } from "@/amplify/data/resource";

import { useCategories, useChapters, useUserProgress } from "./";

const client = generateClient<Schema>();

export const useCourses = (query?: {}) => {
  const queryClient = useQueryClient();
  const key = query ? JSON.stringify(query) : `/api/courses`;

  const fetcher = () =>
    client.models.Course.list(query).then((res) => res.data);

  const { data, isLoading, isError } = useQuery(key, fetcher);

  const handleRefresh = () => {
    queryClient.invalidateQueries(key);
  };

  return {
    courses: data,
    isLoading,
    isError,
    handleRefresh,
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
  const { courses, handleRefresh: refreshCourses } = useCourses({
    filter: {
      and: [
        { isPublished: { eq: "true" } },
        { categoryCoursesId: { contains: categoryId } },
        { title: { contains: title } },
      ],
    },
  });

  const { progress: userProgress, handleRefresh: refreshProgress } =
    useUserProgress({
      filter: {
        and: [{ userId: { eq: userId } }],
      },
    });

  const { chapters, handleRefresh: refreshChapters } = useChapters({
    filter: {
      and: [{ isPublished: { eq: "true" } }],
    },
  });

  const { categories, handleRefresh: refreshCategories } = useCategories();

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
    refreshCourses,
    refreshProgress,
    refreshChapters,
    refreshCategories,
  };
};
