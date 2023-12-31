import React from "react";
import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { getCurrentUser } from "aws-amplify/auth/server";

import { ChapterView, CourseLayout } from "@/components";
import { ChapterValues, CourseValues } from "@/types";
import { useChapters } from "@/hooks";
import { goHome, runWithAmplifyServerContext } from "@/utils";

type Props = {
  userId: any;
};

const CourseIdPage: NextPage<Props> = ({ userId }) => {
  const router = useRouter();
  const { courseId } = router.query;

  const { chapters } = useChapters({
    filter: {
      and: [
        { courseChaptersId: { eq: courseId } },
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

// export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
//   try {
//     const { userId } = await runWithAmplifyServerContext({
//       nextServerContext: { request: req, response: res },
//       operation: (contextSpec) => getCurrentUser(contextSpec),
//     });

//     if (!userId) return goHome();

//     return { props: { userId } };
//   } catch (error) {
//     goHome();
//   }
// };

export default CourseIdPage;
