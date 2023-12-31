import { ChapterValues, CourseValues } from "@/types";
import { CourseProgress, CourseSidebarItem } from "@/components";

interface CourseSidebarProps {
  isLoading?: boolean;
  course?: CourseValues;
  progressCount: number;
  chapters: (ChapterValues & { isCompleted: boolean })[];
}

export const CourseSidebar = ({
  isLoading = false,
  course,
  progressCount = 0,
  chapters = [],
}: CourseSidebarProps) => {
  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <div className="p-4 md:py-8 md:px-6 flex flex-col">
        <h1 className="font-semibold">
          {isLoading ? "Loading..." : course?.title}
        </h1>
        <div className="mt-4 md:mt-6">
          <CourseProgress
            isLoading={isLoading}
            variant={progressCount === 100 ? "success" : "default"}
            value={progressCount}
          />
        </div>
      </div>
      <div className="flex flex-col w-full">
        {!isLoading &&
          chapters?.map((chapter) => (
            <CourseSidebarItem
              key={chapter.id}
              id={chapter.id}
              label={chapter.title}
              isCompleted={chapter.isCompleted}
              courseId={course?.id}
              isLocked={!chapter.isFree}
            />
          ))}
      </div>
    </div>
  );
};
