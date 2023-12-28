import useSWR from "swr";
import { generateClient } from "aws-amplify/api";

import { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

export const useChapters = (query?: {}) => {
  const fetcher = () =>
    client.models.Chapter.list(query).then((res) => res.data);

  const { data, error, isLoading } = useSWR(
    query ? JSON.stringify(query) : `/api/chapters`,
    fetcher
  );

  return {
    chapters: data,
    isLoading,
    isError: error,
  };
};
