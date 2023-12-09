import React from "react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { InfoCard } from "@/components";
import { CheckCircle, Clock } from "lucide-react";

export default function Home() {
  return (
    <DashboardLayout title="Home" pageDescription="">
      <div className="px-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoCard icon={Clock} label="In Progress" numberOfItems={0} />
          <InfoCard
            icon={CheckCircle}
            label="Completed"
            numberOfItems={0}
            variant="success"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
