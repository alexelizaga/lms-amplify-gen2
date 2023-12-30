import { timeDuration } from "@/utils";
import {
  CourseNotification,
  CourseProgressButton,
  Preview,
  VideoPlayer,
} from "../";
import { Divider } from "@aws-amplify/ui-react";
import { ChapterValues, CourseValues } from "@/types";

export const ChapterView = ({
  isLoading,
  isLocked,
  course,
  chapter,
  nextChapterId,
  onEnded,
  handleRefreshProgress,
}: {
  isLoading: boolean;
  isLocked: boolean;
  course?: CourseValues;
  chapter: ChapterValues & { isCompleted: boolean };
  nextChapterId?: string;
  onEnded?: () => void;
  handleRefreshProgress?: () => void;
}) => {
  return (
    <>
      <CourseNotification
        isVisible={!isLoading}
        isCompleted={chapter.isCompleted || false}
        isLocked={isLocked}
      />
      <div className="p-4 flex flex-col gap-16 max-w-4xl mx-auto">
        <div className="shadow-2xl shadow-black rounded-md">
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
                refresh={handleRefreshProgress}
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
    </>
  );
};
