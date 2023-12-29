import { useQuery } from "react-query";
import { useQueryClient } from "react-query";
import { generateClient } from "aws-amplify/api";

import { Schema } from "@/amplify/data/resource";
import { orderByPosition } from "@/utils";

import { useUserProgress } from "./";

const client = generateClient<Schema>();

export const useChapters = (query?: {}) => {
  const queryClient = useQueryClient();
  const key = query ? JSON.stringify(query) : `/api/chapters`;

  const fetcher = () =>
    client.models.Chapter.list(query).then((res) => res.data);

  const { data, isLoading, isError } = useQuery(key, fetcher);

  const handleRefresh = () => {
    queryClient.invalidateQueries(key);
  };

  return {
    chapters: data?.sort(orderByPosition),
    isLoading,
    isError,
    handleRefresh,
  };
};

export const useChaptersWithProgress = (
  courseId: string,
  userId: string,
  query?: {}
) => {
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
      and: [{ courseId: { eq: courseId } }, { userId: { eq: userId } }],
    },
  });

  const isChapterCompleted = (chapterId: string): boolean => {
    return !!userProgress?.find(
      (progress) => progress.chapterId === chapterId && progress.isCompleted
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
