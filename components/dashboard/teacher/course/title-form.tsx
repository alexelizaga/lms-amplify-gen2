import React from "react";
import { useRouter } from "next/router";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Button, Input, Text, View, useTheme } from "@aws-amplify/ui-react";
import toast from "react-hot-toast";
import { Pencil, Save, X } from "lucide-react";

import { CourseValues } from "@/types";

interface TitleFormProps {
  initialData: CourseValues;
}

const formSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required",
  }),
});

export const TitleForm = ({ initialData }: TitleFormProps) => {
  const { tokens } = useTheme();
  const router = useRouter();
  const [isEditing, setIsEditing] = React.useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const {
    register,
    setValue,
    formState: { isSubmitting, isValid, errors },
  } = form;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/courses/${initialData.courseId}`, values);
      toast.success("Course updated");
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
        <Button variation="link" size="small" onClick={toggleEdit}>
          {isEditing ? (
            <X className="h-4 w-4" />
          ) : (
            <Pencil className="h-4 w-4" />
          )}
        </Button>
      </div>
      {!isEditing && <p className="text-sm mt-2">{initialData.title}</p>}
      {isEditing && (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <Input
            isDisabled={isSubmitting}
            placeholder="e.g. 'Advanced web development'"
            {...register("title")}
            onChange={({ target: { value } }) => {
              setValue("title", value, {
                shouldValidate: true,
                shouldTouch: true,
              });
            }}
          />
          <div className="flex items-center gap-x-2">
            <Button
              type="submit"
              variation="primary"
              size="small"
              isDisabled={!isValid}
              isLoading={isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            {errors.title && (
              <Text
                variation="warning"
                as="p"
                isTruncated
                fontSize="0.9em"
                marginLeft={6}
              >
                {errors.title.message}
              </Text>
            )}
          </div>
        </form>
      )}
    </View>
  );
};
