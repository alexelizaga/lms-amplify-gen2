import React from "react";
import { useRouter } from "next/router";
import axios from "axios";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Button, Flex, Input, View, useTheme } from "@aws-amplify/ui-react";
import { Pencil } from "lucide-react";

import { ChapterValues } from "@/types";

interface ChapterTitleFormProps {
  initialData: ChapterValues;
}

const formSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required",
  }),
});

export const ChapterTitleForm = ({ initialData }: ChapterTitleFormProps) => {
  const { tokens } = useTheme();
  const router = useRouter();
  const [isEditing, setIsEditing] = React.useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
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
        Title
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
      {!isEditing && <p className="text-sm mt-2">{initialData.title}</p>}
      {isEditing && (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <Flex direction="column" gap="small">
            <Input
              id="title"
              hasError={!!errors.title}
              disabled={isSubmitting}
              placeholder="e.g. 'Introduction to the course'"
              {...register("title")}
            />
            {errors.title?.message && (
              <p className="text-sm text-red-800">{errors.title?.message}</p>
            )}
          </Flex>
          <div className="flex items-center gap-x-2">
            <Button
              size="small"
              disabled={!isValid}
              isLoading={isSubmitting}
              type="submit"
            >
              Save
            </Button>
          </div>
        </form>
      )}
    </View>
  );
};
