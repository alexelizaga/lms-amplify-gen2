import React from "react";
import { useRouter } from "next/router";
import axios from "axios";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Pencil, Save, X } from "lucide-react";
import { Button, Flex, View, useTheme } from "@aws-amplify/ui-react";

import { ChapterValues } from "@/types";
import { cn } from "@/utils";
import { Editor, Preview } from "@/components";

interface ChapterDescriptionFormProps {
  initialData: ChapterValues;
}

const formSchema = z.object({
  description: z.string().min(1, {
    message: "Description is required",
  }),
});

export const ChapterDescriptionForm = ({
  initialData,
}: ChapterDescriptionFormProps) => {
  const { tokens } = useTheme();
  const router = useRouter();
  const [isEditing, setIsEditing] = React.useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: initialData?.description ?? "",
    },
  });

  const { setValue, getValues } = form;
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
    } catch {
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
        Description
        <Button variation="link" size="small" onClick={toggleEdit}>
          {isEditing ? (
            <X className="h-4 w-4" />
          ) : (
            <Pencil className="h-4 w-4" />
          )}
        </Button>
      </div>
      {!isEditing && (
        <div
          className={cn(
            "text-sm mt-2",
            !initialData.description && "text-slate-500 italic"
          )}
        >
          {!initialData.description && "No description"}
          {initialData.description && (
            <Preview value={initialData.description} />
          )}
        </div>
      )}
      {isEditing && (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <Flex direction="column" gap="small" minHeight={114}>
            <Editor
              value={getValues("description")}
              onChange={(value) => {
                setValue("description", value, {
                  shouldValidate: true,
                  shouldTouch: true,
                });
              }}
            />
            {errors.description?.message && (
              <p className="text-sm text-red-800">
                {errors.description?.message}
              </p>
            )}
          </Flex>
          <div className="flex items-center gap-x-2">
            <Button
              type="submit"
              variation="primary"
              size="small"
              disabled={!isValid}
              isLoading={isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </form>
      )}
    </View>
  );
};
