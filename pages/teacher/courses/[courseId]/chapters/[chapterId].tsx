import { GetServerSideProps, NextPage } from "next";
import Link from "next/link";
import { getCurrentUser } from "aws-amplify/auth/server";
import { ArrowLeft, Eye, LayoutDashboard, Video } from "lucide-react";

import {
  ChapterAccessForm,
  ChapterActions,
  ChapterDescriptionForm,
  ChapterStreamForm,
  ChapterTitleForm,
  DashboardLayout,
  IconBadge,
} from "@/components";
import { ChapterValues } from "@/types";
import { reqResBasedClient, runWithAmplifyServerContext } from "@/utils";
import { Alert, View, useTheme } from "@aws-amplify/ui-react";

type Props = {
  chapter: ChapterValues;
};

const ChapterIdPage: NextPage<Props> = ({ chapter }) => {
  const { tokens } = useTheme();
  const requiredFields = [
    chapter?.title,
    chapter?.description,
    chapter?.video || chapter?.streamUrl,
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;

  const completionText = `(${completedFields}/${totalFields})`;

  const isComplete = requiredFields.every(Boolean);

  return (
    <DashboardLayout title={chapter?.title} pageDescription="">
      <div className="px-6 pb-16">
        {!chapter.isPublished ? (
          <div className="mb-6">
            <Alert
              variation="warning"
              isDismissible={false}
              hasIcon={true}
              heading="Alert"
            >
              This chapter is unpublished. It will not be visible in the course.
            </Alert>
          </div>
        ) : (
          <></>
        )}
        <div className="flex items-center justify-between">
          <div className="w-full">
            <Link
              href={`/teacher/courses/${chapter.courseChaptersId}`}
              className="flex items-center text-sm hover:opacity-75 transition mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to course setup
            </Link>
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col gap-y-2">
                <h1 className="text-2xl font-medium">Chapter Creation</h1>
                <View color={tokens.colors.primary[30]} className="text-sm">
                  Complete all fields {completionText}
                </View>
              </div>
              <ChapterActions
                disabled={!isComplete}
                courseId={chapter.courseChaptersId ?? ""}
                chapterId={chapter.id}
                isPublished={chapter.isPublished ?? false}
              />
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
            <ChapterStreamForm initialData={chapter} />
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
  } catch (error) {
    return {
      redirect: {
        destination: `/teacher/courses/${courseId}`,
        permanent: false,
      },
    };
  }
};

export default ChapterIdPage;
