import React from "react";
import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { getCurrentUser } from "aws-amplify/auth/server";

import { ChapterView, CourseLayout } from "@/components";
import { ChapterValues, CourseValues } from "@/types";
import {
  useChapterWithUserProgress,
  useChapters,
  useChaptersWithProgress,
  useUserProgress,
} from "@/hooks";
import { goHome, runWithAmplifyServerContext } from "@/utils";

type Props = {
  userId: any;
};

const CourseIdPage: NextPage<Props> = ({ userId }) => {
  const router = useRouter();
  const { courseId } = router.query;

  const { chapters } = useChaptersWithProgress({
    userId,
    query: {
      filter: {
        and: [
          { courseChaptersId: { eq: courseId } },
          { isPublished: { eq: "true" } },
        ],
      },
    },
  });

  React.useEffect(() => {
    if (chapters?.length) {
      const chapterId =
        chapters?.find((chapter) => !chapter.isCompleted && chapter.isPublished)
          ?.id ?? chapters![0].id;
      router.push(`/courses/${courseId}/chapters/${chapterId}`);
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
