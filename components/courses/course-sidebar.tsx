import { ChapterValues, CourseValues } from "@/types";
import { CourseProgress, CourseSidebarItem } from "@/components";

interface CourseSidebarProps {
  course: CourseValues;
  progressCount: number;
  chapters: ChapterValues[];
}

export const CourseSidebar = ({
  course,
  progressCount = 0,
  chapters = [],
}: CourseSidebarProps) => {
  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <div className="px-6 py-8 flex flex-col">
        <h1 className="font-semibold">{course.title}</h1>
        <div className="mt-10">
          <CourseProgress variant="success" value={progressCount} />
        </div>
      </div>
      <div className="flex flex-col w-full">
        {chapters.map((chapter) => (
          <CourseSidebarItem
            key={chapter.id}
            id={chapter.id}
            label={chapter.title}
            isCompleted={false}
            courseId={course.courseId}
            isLocked={!chapter.isFree}
          />
        ))}
      </div>
    </div>
  );
};
