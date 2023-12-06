import React from "react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function Home() {
  return (
    <DashboardLayout title="Home" pageDescription="">
      <div className="px-6">
        <div>Dashboard Page</div>
      </div>
    </DashboardLayout>
  );
}
