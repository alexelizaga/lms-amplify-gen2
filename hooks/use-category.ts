import { useQuery } from "react-query";
import { useQueryClient } from "react-query";
import { generateClient } from "aws-amplify/api";

import { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

export const useCategory = (id: string) => {
  const queryClient = useQueryClient();
  const key = `/api/category/${id}`;

  const fetcher = () =>
    client.models.Category.get({
      id,
    }).then((res) => res.data);

  const { data, isLoading, isError } = useQuery(`/api/category/${id}`, fetcher);

  const handleRefresh = () => {
    queryClient.invalidateQueries(key);
  };

  return {
    category: data,
    isLoading,
    isError,
    handleRefresh,
  };
};
