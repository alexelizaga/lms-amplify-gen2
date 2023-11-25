import { Button } from "@aws-amplify/ui-react";
import Link from "next/link";

import { DashboardLayout } from "@/components/layout/dashboard-layout";

const CoursesPage = () => {
  return (
    <DashboardLayout title="Teacher - Courses" pageDescription="">
      <div className="p-6">
        <Link href="/teacher/create">
          <Button size="small">New Course</Button>
        </Link>
      </div>
    </DashboardLayout>
  );
};

export default CoursesPage;
