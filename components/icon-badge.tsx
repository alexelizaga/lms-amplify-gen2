import { LucideIcon } from "lucide-react";

import { cn } from "@/utils/cn";

interface IconBadgeProps {
  icon: LucideIcon;
  variant?: "default" | "success";
  size?: "default" | "sm";
}

export const IconBadge = ({
  icon: Icon,
  variant = "default",
  size = "default",
}: IconBadgeProps) => {
  const backgroundVariants = cn(
    "rounded-full flex items-center justify-center",
    variant === "default" && "text-sky-700 bg-sky-100",
    variant === "success" && "bg-emerald-100",
    size === "default" && "p-2",
    size === "sm" && "p-1"
  );

  const iconVariants = cn(
    variant === "default" && "text-sky-700",
    variant === "success" && "text-emerald-700",
    size === "default" && "h-6 w-6",
    size === "sm" && "h-4 w-4"
  );

  return (
    <div className={backgroundVariants}>
      <Icon className={iconVariants} />
    </div>
  );
};
