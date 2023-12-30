import React from "react";
import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { getCurrentUser } from "aws-amplify/auth/server";
import { Loader2 } from "lucide-react";

import { ChapterView, CourseLayout, DashboardLayout } from "@/components";
import { ChapterValues, CourseValues } from "@/types";
import {
  orderByPosition,
  reqResBasedClient,
  runWithAmplifyServerContext,
} from "@/utils";
import { useChapters } from "@/hooks";

type Props = {
  course: CourseValues;
  chapters: ChapterValues[];
};

const CourseIdPage: NextPage<Props> = () => {
  const router = useRouter();
  const { courseId } = router.query;

  const { chapters } = useChapters({
    filter: {
      and: [
        { courseChaptersCourseId: { eq: courseId } },
        { isPublished: { eq: "true" } },
      ],
    },
  });

  React.useEffect(() => {
    if (chapters?.length) {
      router.push(`/courses/${courseId}/chapters/${chapters[0].id}`);
    }
  }, [chapters, courseId]);

  return (
    <CourseLayout
      isLoading={true}
      title={""}
      pageDescription={""}
      progressCount={0}
      chapters={[]}
    >
      <ChapterView
        isLoading={true}
        isLocked={false}
        chapter={{} as ChapterValues & { isCompleted: boolean }}
      />
    </CourseLayout>
  );
};

export default CourseIdPage;
