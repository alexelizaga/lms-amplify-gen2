import { useQuery, useQueryClient } from "@tanstack/react-query";
import { generateClient } from "aws-amplify/api";

import { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

export const useCategory = (id: string) => {
  const queryClient = useQueryClient();
  const queryKey = [`category`, { id }];

  const queryFn = () =>
    client.models.Category.get({
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
    category: data,
    ...props,
    handleRefresh,
  };
};
