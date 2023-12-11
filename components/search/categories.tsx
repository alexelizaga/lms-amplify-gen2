import { CategoryValues } from "@/types";

import { CategoryItem } from "./category-item";

interface CategoriesProps {
  items: CategoryValues[];
}

export const Categories = ({ items }: CategoriesProps) => {
  return (
    <div className="flex items-center gap-x-2 overflow-x-auto pb-2">
      {items.map((item) => (
        <CategoryItem
          key={item.id}
          label={item.name}
          icon={item.icon ?? undefined}
          value={item.id}
        />
      ))}
    </div>
  );
};
