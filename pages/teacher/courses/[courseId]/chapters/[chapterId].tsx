import { GetServerSideProps, NextPage } from "next";
import Link from "next/link";
import { getCurrentUser } from "aws-amplify/auth/server";
import { ArrowLeft, Eye, LayoutDashboard, Video } from "lucide-react";

import {
  ChapterAccessForm,
  ChapterDescriptionForm,
  ChapterTitleForm,
  DashboardLayout,
  IconBadge,
} from "@/components";
import { ChapterValues } from "@/types";
import { reqResBasedClient, runWithAmplifyServerContext } from "@/utils";

type Props = {
  chapter: ChapterValues;
};

const ChapterIdPage: NextPage<Props> = ({ chapter }) => {
  const requiredFields = [chapter?.title, chapter?.description, chapter?.video];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;

  const completionText = `(${completedFields}/${totalFields})`;

  return (
    <DashboardLayout title={chapter?.title} pageDescription="">
      <div className="px-6">
        <div className="flex items-center justify-between">
          <div className="w-full">
            <Link
              href={`/teacher/courses/course?id=${chapter.courseChaptersCourseId}`}
              className="flex items-center text-sm hover:opacity-75 transition mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to course setup
            </Link>
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col gap-y-2">
                <h1 className="text-2xl font-medium">Chapter Creation</h1>
                <span className="text-sm text-slate-700">
                  Complete all fields {completionText}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={LayoutDashboard} />
                <h2 className="text-xl">Customize your chapter</h2>
              </div>
              <ChapterTitleForm initialData={chapter} />
              <ChapterDescriptionForm initialData={chapter} />
            </div>
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={Eye} />
                <h2 className="text-xl">Access Settings</h2>
              </div>
              <ChapterAccessForm initialData={chapter} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={Video} />
              <h2 className="text-xl">Add a video</h2>
            </div>
            {/* <ChapterYoutubeForm
                initialData={chapter}
                courseId={params.courseId}
                chapterId={params.chapterId}
              /> */}
            {/* <ChapterVideoForm
                initialData={chapter}
                courseId={params.courseId}
                chapterId={params.chapterId}
              /> */}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  params,
  req,
  res,
}) => {
  const { chapterId: id = "" } = params as {
    courseId: string;
    chapterId: string;
  };

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

  return { props: { chapter } };
};

export default ChapterIdPage;
