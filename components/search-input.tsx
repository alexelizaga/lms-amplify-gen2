import React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { SearchField } from "@aws-amplify/ui-react";
import qs from "query-string";

import { useDebounce } from "@/hooks";

export const SearchInput = () => {
  const [value, setValue] = React.useState("");
  const debouncedValue = useDebounce(value);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentCategoryId = searchParams.get("categoryId");

  React.useEffect(() => {
    const url = qs.stringifyUrl(
      {
        url: pathname,
        query: {
          categoryId: currentCategoryId,
          title: debouncedValue,
        },
      },
      { skipEmptyString: true, skipNull: true }
    );

    router.push(url);
  }, [debouncedValue, currentCategoryId, router, pathname]);

  return (
    <div className="relative">
      <SearchField
        label="Search"
        placeholder="Search for a course"
        hasSearchButton={false}
        hasSearchIcon={true}
        value={value}
        onChange={({ target }) => setValue(target.value)}
      />
    </div>
  );
};
