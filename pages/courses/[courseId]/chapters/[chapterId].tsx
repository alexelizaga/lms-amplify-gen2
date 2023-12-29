import React from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import axios from "axios";
import toast from "react-hot-toast";
import { Alert, Divider } from "@aws-amplify/ui-react";

import {
  CourseLayout,
  CourseNotification,
  CourseProgressButton,
  Preview,
  VideoPlayer,
} from "@/components";
import { UserValues } from "@/types";
import { timeDuration } from "@/utils";
import {
  useChapterWithUserProgress,
  useChaptersWithProgress,
  useConfettiStore,
  useCourses,
} from "@/hooks";

type Props = {
  user: UserValues;
};

const ChapterIdPage: NextPage<Props> = ({ user: { userId } }) => {
  const confetti = useConfettiStore();
  const router = useRouter();
  const { courseId = "", chapterId = "" } = router.query;

  const { chapter, isLoading: isLoadingChapter } = useChapterWithUserProgress(
    `${chapterId}`
  );
  const { courses, isLoading: isLoadingCourses } = useCourses({
    filter: {
      and: [{ courseId: { eq: courseId } }],
    },
  });
  const { chapters, isLoading: isLoadingChapters } = useChaptersWithProgress(
    `${courseId}`,
    userId,
    {
      filter: {
        and: [
          { courseChaptersCourseId: { eq: courseId } },
          { isPublished: { eq: "true" } },
        ],
      },
    }
  );
  const isLoading = React.useMemo(
    () => isLoadingChapter || isLoadingCourses || isLoadingChapters,
    [isLoadingChapter, isLoadingChapters, isLoadingCourses]
  );

  const course = React.useMemo(
    () => (courses?.length ? courses[0] : undefined),
    [courses]
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
  const nextChapterId = chapters?.find(
    (chapter) => chapter.position === chapter?.position! + 1
  )?.id;

  const progressCount = (completedChapters / numberChapters) * 100;

  const onEnded = async () => {
    try {
      if (course && chapter?.isCompleted) {
        confetti.onOpen();
        await axios.put(
          `/api/courses/${course.courseId}/chapters/${chapter.id}/progress`,
          {
            isCompleted: true,
          }
        );
        toast.success("Progress updated");
        if (nextChapterId) {
          router.push(`/courses/${course.courseId}/chapters/${nextChapterId}`);
        } else {
          router.reload();
        }
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <CourseLayout
      isLoading={isLoading}
      title={chapter.title ?? ""}
      pageDescription={chapter.description ?? ""}
      course={course}
      progressCount={progressCount}
      chapters={chapters}
    >
      <CourseNotification
        isVisible={!isLoading}
        isCompleted={chapter.isCompleted || false}
        isLocked={isLocked}
      />
      <div className="p-4 flex flex-col gap-16 max-w-4xl mx-auto">
        <div className="shadow-2xl shadow-black rounded-md overflow-hidden drop-shadow-sm bg-black">
          <VideoPlayer
            url={chapter?.streamUrl ?? ""}
            start={timeDuration(chapter.streamStartTime ?? "00:00:00")}
            end={timeDuration(chapter.streamEndTime ?? "00:00:00")}
            isLocked={isLocked}
            onEnded={onEnded}
            isLoading={isLoading}
          />
        </div>
        <div>
          <div className="flex flex-col md:flex-row items-center justify-between">
            <h2 className="text-2xl font-semibold">
              {isLoading ? "Loading..." : chapter.title}
            </h2>
            {
              <CourseProgressButton
                isLoading={isLoading}
                chapterId={chapter.id ?? ""}
                courseId={course?.courseId ?? ""}
                nextChapterId={nextChapterId}
                isCompleted={!!chapter?.isCompleted}
              />
            }
          </div>
          {chapter.description !== "<p><br></p>" && (
            <>
              <div className="mt-4 mb-8">
                <Divider orientation="horizontal" size="small" />
              </div>
              <Preview value={chapter.description!} />
            </>
          )}
        </div>
      </div>
    </CourseLayout>
  );
};

export default ChapterIdPage;
