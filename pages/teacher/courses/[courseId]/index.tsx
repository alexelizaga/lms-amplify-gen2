import React from "react";
import { NextPage } from "next";
import { generateClient } from "aws-amplify/data";
import { getCurrentUser } from "aws-amplify/auth";

import { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

type Props = {
  courseId: string;
};

const CourseIdPage: NextPage<Props> = async ({ courseId: id }) => {
  const [course, setCourse] = React.useState<Schema["Course"]>();
  const { userId } = await getCurrentUser();

  async function getCourse() {
    const { data } = await client.models.Course.get({
      id,
      userId,
    });
    setCourse(data);
  }

  React.useEffect(() => {
    getCourse();
  }, []);

  return (
    <div>
      <div>CourseId: {course?.id}</div>
    </div>
  );
};

export default CourseIdPage;
