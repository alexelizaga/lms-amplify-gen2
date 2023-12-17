import { ChapterValues, CourseValues } from "@/types";
import { NavbarRoutes, CourseMobileSidebar } from "@/components";

interface CourseNavbarProps {
  course: CourseValues;
  progressCount: number;
  chapters: (ChapterValues & { isCompleted: boolean })[];
}

export const CourseNavbar = ({
  course,
  progressCount,
  chapters,
}: CourseNavbarProps) => {
  return (
    <div className="p-4 h-full flex items-center">
      <CourseMobileSidebar
        course={course}
        progressCount={progressCount}
        chapters={chapters}
      />
      <NavbarRoutes />
    </div>
  );
};
