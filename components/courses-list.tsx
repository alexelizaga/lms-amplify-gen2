import { CourseCard } from "@/components/course-card";
import { CourseValues } from "@/types";

interface CoursesListProps {
  items: (CourseValues & { userProgress: number; numberOfChapters: number })[];
}

export const CoursesList = ({ items }: CoursesListProps) => {
  return (
    <div>
      <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
        {items.map((item) => (
          <CourseCard
            key={item.courseId}
            id={item.courseId}
            title={item.title}
            imageUrl={item.imageUrl || ""}
            chaptersLength={item.numberOfChapters}
            price={item.price ?? 0}
            progress={item.userProgress}
            category={"Music"}
          />
        ))}
      </div>
      {items.length === 0 && (
        <div className="text-center text-sm text-muted-foreground mt-10">
          No courses found
        </div>
      )}
    </div>
  );
};
