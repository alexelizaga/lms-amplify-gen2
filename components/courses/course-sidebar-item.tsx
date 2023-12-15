import { usePathname, useRouter } from "next/navigation";

import { CheckCircle, Lock, PlayCircle } from "lucide-react";

import { cn } from "@/utils";
import { View, useTheme } from "@aws-amplify/ui-react";

interface CourseSidebarItemProps {
  label: string;
  id: string;
  isCompleted: boolean;
  courseId: string;
  isLocked: boolean;
}

export const CourseSidebarItem = ({
  label,
  id,
  isCompleted,
  courseId,
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

  return (
    <View
      as="button"
      onClick={onClick}
      type="button"
      className={cn(
        "flex items-center gap-x-2 text-sm font-[500] pl-4 md:pl-6 transition-all hover:bg-slate-300/10",
        isCompleted && "text-emerald-700 hover:text-emerald-700",
        isCompleted && isActive && "bg-emerald-200/20"
      )}
      color={isActive ? tokens.colors.primary[80] : tokens.colors.primary[100]}
      backgroundColor={
        isActive ? tokens.colors.primary[10] : tokens.colors.primary[0]
      }
    >
      <div className="flex items-center gap-x-2 py-4 text-left">
        <Icon size={22} className={cn(isCompleted && "text-emerald-700")} />
        {label}
      </div>
      <View
        className={cn(
          "ml-auto opacity-0 border-2 h-full transition-all rounded-full",
          isActive && "md:opacity-100",
          isCompleted && "border-emerald-700"
        )}
        borderColor={
          isActive ? tokens.colors.primary[80] : tokens.colors.primary[100]
        }
      />
    </View>
  );
};
