import { useQuery } from "react-query";
import { useQueryClient } from "react-query";
import { generateClient } from "aws-amplify/api";

import { Schema } from "@/amplify/data/resource";
import { useUserProgress } from ".";

const client = generateClient<Schema>();

export const useChapter = (id: string) => {
  const queryClient = useQueryClient();

  const key = `/api/chapter/${id}`;

  const fetcher = () =>
    client.models.Chapter.get({
      id,
    }).then((res) => res.data);

  const { data, isLoading, isError } = useQuery(key, fetcher);

  const handleRefresh = () => {
    queryClient.invalidateQueries(key);
  };

  return {
    chapter: data,
    isLoading,
    isError,
    handleRefresh,
  };
};

export const useChapterWithUserProgress = (id: string) => {
  const { progress: userProgress } = useUserProgress({
    filter: {
      and: [{ chapterId: { eq: id } }],
    },
  });

  const queryClient = useQueryClient();

  const key = `/api/chapter/${id}`;

  const fetcher = () =>
    client.models.Chapter.get({
      id,
    }).then((res) => res.data);

  const { data, isLoading, isError } = useQuery(key, fetcher);

  const handleRefresh = () => {
    queryClient.invalidateQueries(key);
  };

  return {
    chapter: {
      ...data,
      streamUrl: data?.isFree ? data.streamUrl : "",
      streamStartTime: data?.isFree ? data.streamStartTime : "",
      streamEndTime: data?.isFree ? data.streamEndTime : "",
      isCompleted: userProgress?.length ? userProgress[0].isCompleted : false,
    },
    isLoading,
    isError,
    handleRefresh,
  };
};
