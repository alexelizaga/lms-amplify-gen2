import { GetServerSideProps } from "next";

import { runWithAmplifyServerContext } from "@/utils/amplifyServerUtils";
import { getCurrentUser } from "aws-amplify/auth/server";
import { AuthUser } from "aws-amplify/auth";

import { DashboardLayout } from "@/components/layout/dashboard-layout";

interface UserProps {
  currentUser: AuthUser;
}

export default function User({ currentUser }: UserProps) {
  return (
    <DashboardLayout title="User" pageDescription="">
      <div>username: {currentUser.username}</div>
      <div>userId: {currentUser.userId}</div>
      <div>loginId: {currentUser.signInDetails?.loginId}</div>
      <div>authFlowType: {currentUser.signInDetails?.authFlowType}</div>
    </DashboardLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const currentUser = await runWithAmplifyServerContext({
    nextServerContext: { request: req, response: res },
    operation: (contextSpec) => getCurrentUser(contextSpec),
  });

  return { props: { currentUser } };
};
