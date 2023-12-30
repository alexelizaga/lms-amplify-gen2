import { useQuery, useQueryClient } from "@tanstack/react-query";
import { generateClient } from "aws-amplify/api";

import { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

export const useUserProgress = (query?: {}) => {
  const queryClient = useQueryClient();
  const queryKey = query ? [query] : ["user-progress"];

  const queryFn = () =>
    client.models.UserProgress.list(query).then((res) => res.data);

  const { data, ...props } = useQuery({
    queryKey,
    queryFn,
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  return {
    progress: data,
    ...props,
    handleRefresh,
  };
};
