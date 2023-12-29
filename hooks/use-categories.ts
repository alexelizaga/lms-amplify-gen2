import { useQuery } from "react-query";
import { useQueryClient } from "react-query";
import { generateClient } from "aws-amplify/api";

import { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

export const useCategories = (query?: {}) => {
  const queryClient = useQueryClient();
  const key = query ? JSON.stringify(query) : `/api/categories`;

  const fetcher = () =>
    client.models.Category.list(query).then((res) => res.data);

  const { data, isLoading, isError } = useQuery(key, fetcher);

  const handleRefresh = () => {
    queryClient.invalidateQueries(key);
  };

  return {
    categories: data,
    isLoading,
    isError,
    handleRefresh,
  };
};
