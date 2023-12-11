import { GetServerSideProps, NextPage } from "next";
import { getCurrentUser } from "aws-amplify/auth/server";
import { Divider } from "@aws-amplify/ui-react";

import { CourseLayout, Preview, VideoPlayer } from "@/components";
import { ChapterValues, CourseValues } from "@/types";
import {
  orderByPosition,
  reqResBasedClient,
  runWithAmplifyServerContext,
  timeDuration,
} from "@/utils";

type Props = {
  course: CourseValues;
  chapters: ChapterValues[];
  chapter: ChapterValues;
};

const ChapterIdPage: NextPage<Props> = ({ course, chapters, chapter }) => {
  return (
    <CourseLayout
      title={chapter.title}
      pageDescription={chapter.description ?? ""}
      course={course}
      progressCount={0}
      chapters={chapters}
    >
      <div className="p-4 flex flex-col gap-16 max-w-4xl mx-auto pb-20">
        {chapter.streamUrl && (
          <div className="border shadow-2xl shadow-black rounded-md overflow-hidden drop-shadow-sm">
            <VideoPlayer
              url={chapter?.streamUrl ?? ""}
              start={timeDuration(chapter.streamStartTime ?? "00:00:00")}
              end={timeDuration(chapter.streamEndTime ?? "00:00:00")}
            />
          </div>
        )}
        <div>
          <div className="flex flex-col md:flex-row items-center justify-between">
            <h2 className="text-2xl font-semibold mb-2">{chapter.title}</h2>
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
  const { chapterId: id = "", courseId = "" } = params as {
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
              and: [{ courseId: { eq: courseId } }, { userId: { eq: userId } }],
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

    const chapters = await runWithAmplifyServerContext({
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

    const chapter = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: async (contextSpec) => {
        const { data: chapter } = await reqResBasedClient.models.Chapter.get(
          contextSpec,
          {
            id,
          }
        );
        return JSON.parse(JSON.stringify(chapter));
      },
    });

    if (!chapter) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    return { props: { course, chapters, chapter } };
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
