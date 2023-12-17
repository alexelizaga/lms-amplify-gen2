import { GetServerSideProps, NextPage } from "next";
import { getCurrentUser } from "aws-amplify/auth/server";
import { Alert, Divider } from "@aws-amplify/ui-react";

import {
  CourseLayout,
  CourseProgressButton,
  Preview,
  VideoPlayer,
} from "@/components";
import { ChapterValues, CourseValues, UserProgressValues } from "@/types";
import {
  orderByPosition,
  reqResBasedClient,
  runWithAmplifyServerContext,
  timeDuration,
} from "@/utils";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useConfettiStore } from "@/hooks";

type Props = {
  course: CourseValues;
  chapters: (ChapterValues & { isCompleted: boolean })[];
  chapter: ChapterValues & { isCompleted: boolean };
  progressCount: number;
  nextChapterId: string;
};

const ChapterIdPage: NextPage<Props> = ({
  course,
  chapters,
  chapter,
  progressCount,
  nextChapterId = "",
}) => {
  const router = useRouter();
  const confetti = useConfettiStore();

  const isLocked = !chapter.isFree;
  const completeOnEnd = !chapter?.isCompleted;

  const onEnded = async () => {
    try {
      if (completeOnEnd) {
        await axios.put(
          `/api/courses/${course.courseId}/chapters/${chapter.id}/progress`,
          {
            isCompleted: true,
          }
        );
        if (!nextChapterId) {
          confetti.onOpen();
        }
        toast.success("Progress updated");
        if (nextChapterId) {
          router.push(`/courses/${course.courseId}/chapters/${nextChapterId}`);
        } else {
          router.refresh();
        }
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <CourseLayout
      title={chapter.title}
      pageDescription={chapter.description ?? ""}
      course={course}
      progressCount={progressCount}
      chapters={chapters}
    >
      <div className="px-4 py-2">
        {chapter.isCompleted ? (
          <Alert
            variation="success"
            isDismissible={false}
            hasIcon={true}
            heading=""
          >
            You already completed this chapter.
          </Alert>
        ) : (
          <></>
        )}
      </div>
      <div className="px-4 py-2">
        {isLocked ? (
          <Alert
            variation="warning"
            isDismissible={false}
            hasIcon={true}
            heading=""
          >
            You need to purchase this course to see this chapter.
          </Alert>
        ) : (
          <></>
        )}
      </div>
      <div className="p-4 flex flex-col gap-16 max-w-4xl mx-auto">
        {chapter.streamUrl && (
          <div className="shadow-2xl shadow-black rounded-md overflow-hidden drop-shadow-sm">
            <VideoPlayer
              url={chapter?.streamUrl ?? ""}
              start={timeDuration(chapter.streamStartTime ?? "00:00:00")}
              end={timeDuration(chapter.streamEndTime ?? "00:00:00")}
              isLocked={isLocked}
              onEnded={onEnded}
            />
          </div>
        )}
        <div>
          <div className="flex flex-col md:flex-row items-center justify-between">
            <h2 className="text-2xl font-semibold mb-2">{chapter.title}</h2>
            {
              <CourseProgressButton
                chapterId={chapter.id}
                courseId={course.courseId}
                nextChapterId={nextChapterId}
                isCompleted={!!chapter?.isCompleted}
              />
            }
          </div>
          <div className="mt-4 mb-8">
            <Divider orientation="horizontal" size="small" />
          </div>
          <Preview value={chapter.description!} />
        </div>
      </div>
    </CourseLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  params,
  req,
  res,
}) => {
  const { chapterId = "", courseId = "" } = params as {
    courseId: string;
    chapterId: string;
  };

  try {
    const { userId } = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: (contextSpec) => getCurrentUser(contextSpec),
    });

    if (!userId) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    const course = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: async (contextSpec) => {
        const { data: course } = await reqResBasedClient.models.Course.list(
          contextSpec,
          {
            filter: {
              and: [{ courseId: { eq: courseId } }],
            },
          }
        );
        if (!course.length) return undefined;
        return JSON.parse(JSON.stringify(course[0]));
      },
    });

    if (!course) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    const chapters: ChapterValues[] = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: async (contextSpec) => {
        const { data: chapters } = await reqResBasedClient.models.Chapter.list(
          contextSpec,
          {
            filter: {
              and: [
                { courseChaptersCourseId: { eq: courseId } },
                { isPublished: { eq: "true" } },
              ],
            },
          }
        );
        return JSON.parse(JSON.stringify(chapters.sort(orderByPosition)));
      },
    });

    const userProgress: UserProgressValues[] =
      await runWithAmplifyServerContext({
        nextServerContext: { request: req, response: res },
        operation: async (contextSpec) => {
          const { data: usersProgress } =
            await reqResBasedClient.models.UserProgress.list(contextSpec, {
              filter: {
                and: [
                  { courseId: { eq: courseId } },
                  { userId: { eq: userId } },
                ],
              },
            });
          return JSON.parse(JSON.stringify(usersProgress));
        },
      });

    const isChapterCompleted = (chapterId: string): boolean => {
      return !!userProgress.find(
        (progress) => progress.chapterId === chapterId && progress.isCompleted
      );
    };

    const chaptersWithUserProgress: (ChapterValues & {
      isCompleted: boolean;
    })[] = chapters.map((chapter) => ({
      ...chapter,
      streamUrl: chapter.isFree ? chapter.streamUrl : "",
      streamStartTime: chapter.isFree ? chapter.streamStartTime : "",
      streamEndTime: chapter.isFree ? chapter.streamEndTime : "",
      isCompleted: isChapterCompleted(chapter.id),
    }));

    const currentChapter = chaptersWithUserProgress.find(
      (chapter) => chapter.id === chapterId
    );

    const nextChapter:
      | (ChapterValues & {
          isCompleted: boolean;
        })
      | undefined = chaptersWithUserProgress.find(
      (chapter) => chapter.position === currentChapter?.position! + 1
    );

    if (!currentChapter) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    const completedChapters = chaptersWithUserProgress.filter(
      (chapter) => chapter.isCompleted
    );
    const progressCount = (completedChapters.length / chapters.length) * 100;

    return {
      props: {
        course,
        chapters: chaptersWithUserProgress,
        chapter: currentChapter,
        progressCount,
        nextChapterId: nextChapter?.id ?? "",
      },
    };
  } catch (error) {
    return {
      redirect: {
        destination: `/`,
        permanent: false,
      },
    };
  }
};

export default ChapterIdPage;
