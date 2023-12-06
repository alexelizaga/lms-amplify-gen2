import React from "react";
import { useRouter } from "next/router";
import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  Button,
  CheckboxField,
  Flex,
  View,
  useTheme,
} from "@aws-amplify/ui-react";
import { Pencil } from "lucide-react";

import { ChapterValues } from "@/types";
import { cn } from "@/utils";

interface ChapterAccessFormProps {
  initialData: ChapterValues;
}

const formSchema = z.object({
  isFree: z.boolean().default(false),
});

export const ChapterAccessForm = ({ initialData }: ChapterAccessFormProps) => {
  const { tokens } = useTheme();
  const [isEditing, setIsEditing] = React.useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isFree: !!initialData.isFree,
    },
  });

  const { setValue, getValues } = form;
  const { isSubmitting, isValid } = form.formState;

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
        Access
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
      {!isEditing && (
        <p
          className={cn(
            "text-sm mt-2",
            !initialData.isFree && "text-slate-500 italic"
          )}
        >
          {initialData.isFree ? (
            <>This chapter is free for preview.</>
          ) : (
            <>This chapter is not free.</>
          )}
        </p>
      )}
      {isEditing && (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <Flex direction="column" gap="small">
            <CheckboxField
              id="isFree"
              name="isFree"
              type="checkbox"
              checked={getValues("isFree")}
              disabled={isSubmitting}
              label="Check this box if you want to make this chapter free for preview"
              onChange={({ target }) => {
                setValue("isFree", target.checked, {
                  shouldValidate: true,
                  shouldTouch: true,
                });
              }}
            />
          </Flex>
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
