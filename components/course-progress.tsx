import React from "react";
import { Loader, Text } from "@aws-amplify/ui-react";

interface CourseProgressProps {
  value: number;
  variant?: "default" | "success";
  size?: "default" | "sm";
  isLoading?: boolean;
}

export const CourseProgress = ({
  value,
  variant,
  size,
  isLoading = false,
}: CourseProgressProps) => {
  const isSuccess = React.useMemo(() => variant === "success", [variant]);
  const isSmall = React.useMemo(() => size === "sm", [size]);
  return (
    <div className="w-full px-2 overflow-hidden">
      <Loader
        size="large"
        variation="linear"
        percentage={value}
        isDeterminate={!isLoading}
        isPercentageTextHidden
      />
      <Text
        variation={isSuccess ? "success" : "primary"}
        fontSize={isSmall ? "12px" : "14px"}
      >
        {isLoading ? 0 : Math.round(value)}% Completed
      </Text>
    </div>
  );
};
