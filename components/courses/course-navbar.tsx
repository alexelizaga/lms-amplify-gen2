import { ChapterValues, CourseValues } from "@/types";
import { NavbarRoutes, CourseMobileSidebar } from "@/components";

interface CourseNavbarProps {
  isLoading?: boolean;
  course?: CourseValues;
  progressCount: number;
  chapters: (ChapterValues & { isCompleted: boolean })[];
}

export const CourseNavbar = ({
  isLoading = false,
  course,
  progressCount,
  chapters,
}: CourseNavbarProps) => {
  return (
    <div className="p-4 h-full flex items-center">
      <CourseMobileSidebar
        isLoading={isLoading}
        course={course}
        progressCount={progressCount}
        chapters={chapters}
      />
      <NavbarRoutes />
    </div>
  );
};
