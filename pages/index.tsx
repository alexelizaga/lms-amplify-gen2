import React from "react";
import { NextPage } from "next";
import { CheckCircle, Clock } from "lucide-react";

import { DashboardLayout, CoursesList, InfoCard } from "@/components";
import { UserValues } from "@/types";
import { useCoursesWithProgress } from "@/hooks";

type Props = {
  user: UserValues;
};

const Home: NextPage<Props> = ({ user: { userId } }) => {
  const { courses } = useCoursesWithProgress({ userId });

  const inProgress = React.useMemo(
    () =>
      courses?.filter(
        (course) => course?.userProgress !== 0 && course?.userProgress !== 100
      ) || [],
    [courses]
  );

  const completed = React.useMemo(
    () => courses?.filter((course) => course?.userProgress === 100) || [],
    [courses]
  );

  return (
    <DashboardLayout title="Home" pageDescription="">
      <div className="px-6 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoCard
            icon={Clock}
            label="In Progress"
            numberOfItems={inProgress.length}
          />
          <InfoCard
            icon={CheckCircle}
            label="Completed"
            numberOfItems={completed.length}
            variant="success"
          />
        </div>
        <div className="py-6">
          <CoursesList items={[...inProgress, ...completed]} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Home;
