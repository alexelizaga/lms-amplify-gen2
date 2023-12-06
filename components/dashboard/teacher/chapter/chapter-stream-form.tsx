import React from "react";
import { useRouter } from "next/router";
import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Clapperboard, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import { Button, Flex, Input, View, useTheme } from "@aws-amplify/ui-react";

import { ChapterValues } from "@/types";
import { VideoPlayer } from "@/components";
import { timeDuration } from "@/utils";

interface ChapterYoutubeFormProps {
  initialData: ChapterValues;
}

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;

const formSchema = z.object({
  streamUrl: z.string().min(1),
  streamStartTime: z.string().regex(timeRegex, {
    message: "HH:mm:ss",
  }),
  streamEndTime: z.string().regex(timeRegex, {
    message: "HH:mm:ss",
  }),
});

export const ChapterStreamForm = ({ initialData }: ChapterYoutubeFormProps) => {
  const { tokens } = useTheme();
  const [isEditing, setIsEditing] = React.useState(false);
  const router = useRouter();

  const toggleEdit = () => setIsEditing((current) => !current);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      streamUrl: initialData.streamUrl ?? undefined,
      streamStartTime: initialData.streamStartTime ?? undefined,
      streamEndTime: initialData?.streamEndTime ?? undefined,
    },
  });

  const { register } = form;
  const { isSubmitting, isValid, errors } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(
        `/api/courses/${initialData.courseChaptersCourseId}/chapters/${initialData.id}`,
        values
      );
      toast.success("Chapter updated");
      toggleEdit();
      router.reload();
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <View
      color={tokens.colors.primary[100]}
      backgroundColor={tokens.colors.neutral[10]}
      className="mt-6 border rounded-md p-4"
    >
      <div className="font-medium flex items-center justify-between">
        Stream
        <Button onClick={toggleEdit} variation="link" size="small">
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </>
          )}
        </Button>
      </div>
      {!isEditing && !initialData.streamUrl && (
        <div className="flex items-center justify-center rounded-md relative aspect-video mt-2">
          <Clapperboard className="h-10 w-10 text-slate-500" />
        </div>
      )}
      {!isEditing && initialData.streamUrl && (
        <div className="mt-2">
          <VideoPlayer
            url={initialData?.streamUrl ?? ""}
            start={timeDuration(initialData.streamStartTime ?? "00:00:00")}
            end={timeDuration(initialData.streamEndTime ?? "00:00:00")}
          />
        </div>
      )}
      {isEditing && (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <Flex direction="column" gap="small">
            <Input
              id="streamUrl"
              hasError={!!errors.streamUrl}
              disabled={isSubmitting}
              placeholder="e.g. 'https://www.youtube.com/watch?v=...'"
              {...register("streamUrl")}
            />
            {errors.streamUrl?.message && (
              <p className="text-sm text-red-800">
                {errors.streamUrl?.message}
              </p>
            )}
          </Flex>
          <div className="flex items-center gap-x-2">
            <div>Start</div>
            <div className="w-full">
              <Input
                id="streamStartTime"
                type="text"
                hasError={!!errors.streamStartTime}
                disabled={isSubmitting}
                placeholder="HH:mm:ss"
                {...register("streamStartTime")}
              />
              {errors.streamStartTime?.message && (
                <p className="text-sm text-red-800">
                  {errors.streamStartTime?.message}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-x-2">
            <div className="w-max">End</div>
            <div className="w-full">
              <Input
                id="streamEndTime"
                type="text"
                hasError={!!errors.streamEndTime}
                disabled={isSubmitting}
                placeholder="HH:mm:ss"
                {...register("streamEndTime")}
              />
              {errors.streamEndTime?.message && (
                <p className="text-sm text-red-800">
                  {errors.streamEndTime?.message}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-x-2">
            <Button disabled={!isValid || isSubmitting} type="submit">
              Save
            </Button>
          </div>
        </form>
      )}
    </View>
  );
};
