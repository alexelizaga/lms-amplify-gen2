import { Menu, View } from "@aws-amplify/ui-react";
import { Menu as MenuIcon } from "lucide-react";

import { ChapterValues, CourseValues } from "@/types";
import { CourseSidebar } from "@/components";

interface CourseMobileSidebarProps {
  isLoading?: boolean;
  course?: CourseValues;
  progressCount: number;
  chapters: (ChapterValues & { isCompleted: boolean })[];
}

export const CourseMobileSidebar = ({
  isLoading = false,
  course,
  progressCount = 0,
  chapters = [],
}: CourseMobileSidebarProps) => {
  return (
    <View width="4rem">
      <Menu
        trigger={
          <div className="md:hidden py-2.5 hover:opacity-75 transtion">
            <MenuIcon />
          </div>
        }
        overflow="hidden"
      >
        <CourseSidebar
          isLoading={isLoading}
          course={course}
          chapters={chapters}
          progressCount={progressCount}
        />
      </Menu>
    </View>
  );
};
