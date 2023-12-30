import { useQuery, useQueryClient } from "@tanstack/react-query";
import { generateClient } from "aws-amplify/api";

import { Schema } from "@/amplify/data/resource";
import { orderByPosition } from "@/utils";

import { useUserProgress } from "./";

const client = generateClient<Schema>();

export const useChapters = (query?: {}) => {
  const queryClient = useQueryClient();
  const queryKey = query ? [query] : ["chapters"];

  const queryFn = () =>
    client.models.Chapter.list(query).then((res) => res.data);

  const { data, ...props } = useQuery({
    queryKey,
    queryFn,
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  return {
    chapters: data?.sort(orderByPosition),
    ...props,
    handleRefresh,
  };
};

export const useChaptersWithProgress = ({
  userId,
  courseId,
  query,
}: {
  userId: string;
  courseId?: string;
  query?: {};
}) => {
  const and = courseId
    ? [{ courseId: { eq: courseId } }, { userId: { eq: userId } }]
    : [{ userId: { eq: userId } }];
  const {
    chapters,
    isLoading: isLoadingChapters,
    isError: isErrorChapters,
    handleRefresh: handleRefreshChapters,
  } = useChapters(query);
  const {
    progress: userProgress,
    isLoading: isLoadingProgress,
    isError: isErrorProgress,
    handleRefresh: handleRefreshProgress,
  } = useUserProgress({
    filter: {
      and,
    },
  });

  const isChapterCompleted = (chapterId: string): boolean => {
    return !!userProgress?.find(
      (progress: any) =>
        progress.chapterId === chapterId && progress.isCompleted
    );
  };

  const chaptersWithUserProgress = chapters?.map((chapter) => ({
    ...chapter,
    streamUrl: chapter.isFree ? chapter.streamUrl : "",
    streamStartTime: chapter.isFree ? chapter.streamStartTime : "",
    streamEndTime: chapter.isFree ? chapter.streamEndTime : "",
    isCompleted: isChapterCompleted(chapter.id),
  }));

  return {
    chapters: chaptersWithUserProgress?.sort(orderByPosition),
    isLoading: isLoadingChapters || isLoadingProgress,
    isError: isErrorChapters || isErrorProgress,
    handleRefreshChapters,
    handleRefreshProgress,
  };
};
