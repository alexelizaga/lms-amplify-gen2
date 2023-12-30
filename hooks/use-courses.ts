import { useQuery, useQueryClient } from "@tanstack/react-query";
import { generateClient } from "aws-amplify/api";

import { Schema } from "@/amplify/data/resource";

import { useCategories, useChapters, useUserProgress } from "./";

const client = generateClient<Schema>();

export const useCourses = (query?: {}) => {
  const queryClient = useQueryClient();
  const queryKey = query ? [query] : ["courses"];

  const queryFn = () =>
    client.models.Course.list(query).then((res) => res.data);

  const { data, ...props } = useQuery({
    queryKey,
    queryFn,
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  return {
    courses: data,
    ...props,
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
  const {
    courses,
    isLoading: isLoadingCourses,
    isError: isErrorCourses,
    handleRefresh: refreshCourses,
  } = useCourses({
    filter: {
      and: [
        { isPublished: { eq: "true" } },
        { categoryCoursesId: { contains: categoryId } },
        { title: { contains: title } },
      ],
    },
  });

  const {
    progress: userProgress,
    isLoading: isLoadingProgress,
    isError: isErrorProgress,
    handleRefresh: refreshProgress,
  } = useUserProgress({
    filter: {
      and: [{ userId: { eq: userId } }],
    },
  });

  const {
    chapters,
    isLoading: isLoadingChapters,
    isError: isErrorChapters,
    handleRefresh: refreshChapters,
  } = useChapters({
    filter: {
      and: [{ isPublished: { eq: "true" } }],
    },
  });

  const {
    categories,
    isLoading: isLoadingCategories,
    isError: isErrorCategories,
    handleRefresh: refreshCategories,
  } = useCategories();

  const getCategory = (categoryId: string | undefined): string => {
    if (!categoryId) return "";
    return (
      categories?.find((category) => category.id === categoryId)?.name ?? ""
    );
  };

  const coursesWithProgress = courses?.map((course) => {
    const chaptersCompleted =
      userProgress?.filter(
        (progress: any) =>
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
    isLoading:
      isLoadingCategories ||
      isLoadingChapters ||
      isLoadingCourses ||
      isLoadingProgress,
    isError:
      isErrorCategories || isErrorChapters || isErrorCourses || isErrorProgress,
    refreshCourses,
    refreshProgress,
    refreshChapters,
    refreshCategories,
  };
};
