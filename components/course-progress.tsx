import React from "react";
import { Loader, Text } from "@aws-amplify/ui-react";

interface CourseProgressProps {
  value: number;
  variant?: "default" | "success";
  size?: "default" | "sm";
}

export const CourseProgress = ({
  value,
  variant,
  size,
}: CourseProgressProps) => {
  const isSuccess = React.useMemo(() => variant === "success", [variant]);
  const isSmall = React.useMemo(() => size === "sm", [size]);
  return (
    <div className="w-full px-2 overflow-hidden">
      <Loader
        size="large"
        variation="linear"
        percentage={value}
        isDeterminate
        isPercentageTextHidden
      />
      <Text
        variation={isSuccess ? "success" : "primary"}
        fontSize={isSmall ? "12px" : "14px"}
      >
        {Math.round(value)}% Completed
      </Text>
    </div>
  );
};
