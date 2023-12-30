import { useQuery, useQueryClient } from "@tanstack/react-query";
import { generateClient } from "aws-amplify/api";

import { Schema } from "@/amplify/data/resource";
import { useUserProgress } from ".";

const client = generateClient<Schema>();

export const useChapter = (id: string) => {
  const queryClient = useQueryClient();

  const queryKey = ["chapter", { id }];

  const queryFn = () =>
    client.models.Chapter.get({
      id,
    }).then((res) => res.data);

  const { data, ...props } = useQuery({
    queryKey,
    queryFn,
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  return {
    chapter: data,
    ...props,
    handleRefresh,
  };
};

export const useChapterWithUserProgress = (id: string) => {
  const {
    chapter,
    isLoading: isLoadingChapter,
    isError: isErrorChapter,
    handleRefresh: handleRefreshChapter,
  } = useChapter(id);

  const {
    progress: userProgress,
    isLoading: isLoadingProgress,
    isError: isErrorProgress,
    handleRefresh: handleRefreshProgress,
  } = useUserProgress({
    filter: {
      and: [{ chapterId: { eq: id } }],
    },
  });

  return {
    chapter: {
      ...chapter,
      streamUrl: chapter?.isFree ? chapter.streamUrl : "",
      streamStartTime: chapter?.isFree ? chapter.streamStartTime : "",
      streamEndTime: chapter?.isFree ? chapter.streamEndTime : "",
      isCompleted: userProgress?.length ? userProgress[0].isCompleted : false,
    },
    isLoading: isLoadingChapter || isLoadingProgress,
    isError: isErrorChapter || isErrorProgress,
    handleRefreshChapter,
    handleRefreshProgress,
  };
};
