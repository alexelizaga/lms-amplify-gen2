import React from "react";
import { useRouter } from "next/router";
import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Clapperboard,
  FilePlus2,
  Pencil,
  Save,
  Timer,
  TimerOff,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  Button,
  Flex,
  Grid,
  Input,
  Text,
  View,
  useTheme,
} from "@aws-amplify/ui-react";

import { ChapterValues } from "@/types";
import { VideoPlayer } from "@/components";
import { timeDuration } from "@/utils";

interface ChapterYoutubeFormProps {
  initialData: ChapterValues;
}

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
const isTime = (value: string) => timeRegex.test(value);

const formSchema = z.object({
  streamUrl: z.string().min(1, {
    message: "Url is required",
  }),
  streamStartTime: z.string().refine((value) => isTime(value), {
    message: "Invalid start time",
  }),
  streamEndTime: z.string().refine((value) => isTime(value), {
    message: "Invalid end time",
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

  const {
    register,
    setValue,
    formState: { isSubmitting, isValid, errors },
  } = form;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(
        `/api/courses/${initialData.courseChaptersId}/chapters/${initialData.id}`,
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
        <Button variation="link" size="small" onClick={toggleEdit}>
          {isEditing && <X className="h-4 w-4" />}
          {!isEditing && !initialData.streamUrl && (
            <FilePlus2 className="h-4 w-4" />
          )}
          {!isEditing && initialData.streamUrl && (
            <Pencil className="h-4 w-4" />
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
            isMini
            url={initialData?.streamUrl ?? ""}
            start={timeDuration(initialData.streamStartTime ?? "00:00:00")}
            end={timeDuration(initialData.streamEndTime ?? "00:00:00")}
          />
        </div>
      )}
      {isEditing && (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <Input
            isDisabled={isSubmitting}
            placeholder="e.g. 'https://www.youtube.com/watch?v=...'"
            {...register("streamUrl")}
            onChange={({ target: { value } }) => {
              setValue("streamUrl", value, {
                shouldValidate: true,
                shouldTouch: true,
              });
            }}
          />
          <Grid templateColumns="1fr 1fr" gap={tokens.space.medium}>
            <div className="flex items-center">
              <Timer className="h-6 w-6" />
              <div className="w-full">
                <Input
                  variation="quiet"
                  size="small"
                  isDisabled={isSubmitting}
                  placeholder="hh:mm:ss"
                  {...register("streamStartTime")}
                  onChange={({ target: { value } }) => {
                    setValue("streamStartTime", value, {
                      shouldValidate: true,
                      shouldTouch: true,
                    });
                  }}
                />
              </div>
            </div>
            <div className="flex items-center">
              <TimerOff className="h-6 w-6" />
              <div className="w-full">
                <Input
                  variation="quiet"
                  size="small"
                  isDisabled={isSubmitting}
                  placeholder="hh:mm:ss"
                  {...register("streamEndTime")}
                  onChange={({ target: { value } }) => {
                    setValue("streamEndTime", value, {
                      shouldValidate: true,
                      shouldTouch: true,
                    });
                  }}
                />
              </div>
            </div>
          </Grid>
          <Flex direction="row" alignItems="flex-start" rowGap={10}>
            <Button
              type="submit"
              variation="primary"
              size="small"
              disabled={!isValid || isSubmitting}
              width={85}
              height={35}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <div>
              {errors.streamUrl && (
                <Text variation="warning" as="p" fontSize="0.9em">
                  {errors.streamUrl?.message}
                </Text>
              )}
              {(errors.streamStartTime || errors.streamEndTime) && (
                <Text variation="warning" as="p" fontSize="0.9em">
                  {errors.streamStartTime?.message ||
                    errors.streamEndTime?.message}
                </Text>
              )}
            </div>
          </Flex>
        </form>
      )}
    </View>
  );
};
