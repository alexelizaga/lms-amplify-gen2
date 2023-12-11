import { Loader } from "@aws-amplify/ui-react";

import { cn } from "@/utils";

interface CourseProgressProps {
  value: number;
  variant?: "default" | "success";
  size?: "default" | "sm";
}

const colorByVariant = {
  default: "text-sky-700",
  success: "text-emerald-700",
};

const sizeByVariant = {
  default: "text-sm",
  sm: "text-xs",
};

export const CourseProgress = ({
  value,
  variant,
  size,
}: CourseProgressProps) => {
  return (
    <div className="w-full px-2 overflow-hidden">
      <Loader
        size="large"
        variation="linear"
        percentage={value}
        isDeterminate
        isPercentageTextHidden
      />
      <p
        className={cn(
          "font-medium mt-2 text-sky-700",
          colorByVariant[variant ?? "default"],
          sizeByVariant[size ?? "default"]
        )}
      >
        {Math.round(value)}% Completed
      </p>
    </div>
  );
};
