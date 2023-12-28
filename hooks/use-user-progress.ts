import useSWR from "swr";
import { generateClient } from "aws-amplify/api";

import { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

export const useUserProgress = (query?: {}) => {
  const fetcher = () =>
    client.models.UserProgress.list(query).then((res) => res.data);

  const { data, error, isLoading } = useSWR(
    query ? JSON.stringify(query) : `/api/user-progress`,
    fetcher
  );

  return {
    progress: data,
    isLoading,
    isError: error,
  };
};
