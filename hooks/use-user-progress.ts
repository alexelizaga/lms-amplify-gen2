import { useQuery } from "react-query";
import { useQueryClient } from "react-query";
import { generateClient } from "aws-amplify/api";

import { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

export const useUserProgress = (query?: {}) => {
  const queryClient = useQueryClient();
  const key = query ? JSON.stringify(query) : `/api/user-progress`;

  const fetcher = () =>
    client.models.UserProgress.list(query).then((res) => res.data);

  const { data, isLoading, isError } = useQuery(key, fetcher, {
    cacheTime: 1000 * 60 * 5, // 5 min
    staleTime: 1000 * 60 * 5, // 5 min
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries(key);
  };

  return {
    progress: data,
    isLoading,
    isError,
    handleRefresh,
  };
};
