import { usePathname, useRouter } from "next/navigation";
import { Text, View, useTheme } from "@aws-amplify/ui-react";
import { CheckCircle, Lock, PlayCircle } from "lucide-react";

import { cn } from "@/utils";

interface CourseSidebarItemProps {
  label: string;
  id: string;
  isCompleted: boolean;
  courseId?: string;
  isLocked: boolean;
}

export const CourseSidebarItem = ({
  label,
  id,
  isCompleted,
  courseId = "",
  isLocked,
}: CourseSidebarItemProps) => {
  const { tokens } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  const Icon = isLocked ? Lock : isCompleted ? CheckCircle : PlayCircle;

  const isActive = pathname?.includes(id);

  const onClick = () => {
    router.push(`/courses/${courseId}/chapters/${id}`);
  };

  const getBackgroundColor = () => {
    if (isActive && isCompleted) return tokens.colors.green[10];
    return isActive ? tokens.colors.primary[10] : tokens.colors.primary[0];
  };

  const getBorderColor = () => {
    if (isCompleted) return tokens.colors.green[80];
    return isActive ? tokens.colors.primary[80] : tokens.colors.primary[100];
  };

  return (
    <View
      as="button"
      onClick={onClick}
      type="button"
      className={cn(
        "flex items-center gap-x-2 text-sm font-[500] pl-4 md:pl-6 transition-all hover:bg-slate-300/10"
      )}
      backgroundColor={getBackgroundColor()}
    >
      <div className="flex items-center gap-x-2 py-4 text-left">
        <Text variation={isCompleted ? "success" : "primary"}>
          <Icon size={22} />
        </Text>
        <Text variation={isCompleted ? "success" : "primary"}>{label}</Text>
      </div>
      <View
        className={cn(
          "ml-auto opacity-0 border-2 h-full transition-all rounded-full",
          isActive && "md:opacity-100"
        )}
        borderColor={getBorderColor()}
      />
    </View>
  );
};
