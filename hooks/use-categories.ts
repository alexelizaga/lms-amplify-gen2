import { useQuery, useQueryClient } from "@tanstack/react-query";
import { generateClient } from "aws-amplify/api";

import { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

export const useCategories = (query?: {}) => {
  const queryClient = useQueryClient();
  const queryKey = query ? [query] : ["categories"];

  const queryFn = () =>
    client.models.Category.list(query).then((res) => res.data);

  const { data, ...props } = useQuery({
    queryKey,
    queryFn,
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  return {
    categories: data,
    ...props,
    handleRefresh,
  };
};
