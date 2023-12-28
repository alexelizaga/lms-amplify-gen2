import useSWR from "swr";
import { generateClient } from "aws-amplify/api";

import { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

export const useCategories = (query?: {}) => {
  const fetcher = () =>
    client.models.Category.list(query).then((res) => res.data);

  const { data, error, isLoading } = useSWR(
    query ? JSON.stringify(query) : `/api/categories`,
    fetcher
  );

  return {
    categories: data,
    isLoading,
    isError: error,
  };
};

export const useCategoryById = (id: string) => {
  const fetcher = () =>
    client.models.Category.get({
      id,
    }).then((res) => res.data);

  const { data, error, isLoading } = useSWR(`/api/category/${id}`, fetcher);

  return {
    category: data,
    isLoading,
    isError: error,
  };
};
