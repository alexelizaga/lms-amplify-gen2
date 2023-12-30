import React from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import axios from "axios";
import toast from "react-hot-toast";
import { Divider } from "@aws-amplify/ui-react";

import {
  ChapterView,
  CourseLayout,
  CourseNotification,
  CourseProgressButton,
  Preview,
  VideoPlayer,
} from "@/components";
import { UserValues } from "@/types";
import { timeDuration } from "@/utils";
import { useChaptersWithProgress, useConfettiStore, useCourses } from "@/hooks";

type Props = {
  user: UserValues;
};

const ChapterIdPage: NextPage<Props> = ({ user: { userId } }) => {
  const confetti = useConfettiStore();
  const router = useRouter();
  const { courseId = "", chapterId = "" } = router.query;

  const { courses, isLoading: isLoadingCourses } = useCourses({
    filter: {
      and: [{ courseId: { eq: courseId } }],
    },
  });

  const {
    chapters,
    isLoading: isLoadingChapters,
    handleRefreshProgress,
  } = useChaptersWithProgress({
    userId,
    query: {
      filter: {
        and: [
          { courseChaptersCourseId: { eq: courseId } },
          { isPublished: { eq: "true" } },
        ],
      },
    },
  });

  const chapter = React.useMemo(
    () => chapters?.find((chapter) => chapter.id === chapterId),
    [chapterId, chapters]
  );

  const course = React.useMemo(
    () => (courses?.length ? courses[0] : undefined),
    [courses]
  );

  const isLoading = React.useMemo(
    () => isLoadingCourses || isLoadingChapters,
    [isLoadingChapters, isLoadingCourses]
  );

  const isLocked = React.useMemo(() => !chapter?.isFree, [chapter?.isFree]);
  const completedChapters = React.useMemo(
    () => chapters?.filter((chapter) => chapter.isCompleted).length ?? 0,
    [chapters]
  );
  const numberChapters = React.useMemo(
    () => chapters?.length ?? 0,
    [chapters?.length]
  );
  const nextChapterId = React.useMemo(
    () => chapters?.find((c) => c.position === chapter?.position! + 1)?.id,
    [chapters, chapter?.position]
  );
  const progressCount = (completedChapters / numberChapters) * 100;

  const onEnded = async () => {
    try {
      if (!chapter?.isCompleted) {
        confetti.onOpen();
        await axios.put(
          `/api/courses/${course!.courseId}/chapters/${chapter!.id}/progress`,
          {
            isCompleted: !chapter?.isCompleted,
          }
        );
        toast.success("Progress updated");
        handleRefreshProgress();
        if (nextChapterId) {
          router.push(`/courses/${course!.courseId}/chapters/${nextChapterId}`);
        }
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  if (!chapter) return null;

  return (
    <CourseLayout
      isLoading={isLoading}
      title={chapter.title ?? ""}
      pageDescription={chapter.description ?? ""}
      course={course}
      progressCount={progressCount}
      chapters={chapters}
    >
      <ChapterView
        isLoading={isLoading}
        isLocked={isLocked}
        chapter={chapter}
        course={course}
        nextChapterId={nextChapterId}
        onEnded={onEnded}
        handleRefreshProgress={handleRefreshProgress}
      />
    </CourseLayout>
  );
};

export default ChapterIdPage;
