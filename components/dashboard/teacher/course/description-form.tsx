import React from "react";
import { useRouter } from "next/router";
import * as z from "zod";
import axios from "axios";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Pencil, Save, X } from "lucide-react";
import {
  Button,
  Text,
  TextAreaField,
  View,
  useTheme,
} from "@aws-amplify/ui-react";

import { cn } from "@/utils/cn";
import { CourseValues } from "@/types";

interface DescriptionFormProps {
  initialData: CourseValues;
}

const formSchema = z.object({
  description: z.string().min(1, {
    message: "Description is required",
  }),
});

export const DescriptionForm = ({ initialData }: DescriptionFormProps) => {
  const { tokens } = useTheme();
  const router = useRouter();
  const [isEditing, setIsEditing] = React.useState(false);
  const [isChange, setIsChange] = React.useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: initialData?.description ?? "",
    },
  });

  const {
    register,
    setValue,
    formState: { isSubmitting, isValid, errors },
  } = form;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/courses/${initialData.id}`, values);
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
        <p
          className={cn(
            "text-sm mt-2",
            !initialData.description && "text-slate-500 italic"
          )}
        >
          {initialData.description ?? "No description"}
        </p>
      )}
      {isEditing && (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <TextAreaField
            labelHidden
            label=""
            isDisabled={isSubmitting}
            placeholder="e.g. 'This course is about...'"
            {...register("description")}
            onChange={({ target: { value } }) => {
              setValue("description", value, {
                shouldValidate: true,
                shouldTouch: true,
              });
              setIsChange(value !== initialData.description);
            }}
          />
          <div className="flex items-center gap-x-2">
            <Button
              type="submit"
              variation="primary"
              size="small"
              isDisabled={!isValid || isSubmitting || !isChange}
              isLoading={isSubmitting}
              width={85}
              height={35}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            {errors.description && (
              <Text
                variation="warning"
                as="p"
                isTruncated
                fontSize="0.9em"
                marginLeft={6}
              >
                {errors.description.message}
              </Text>
            )}
          </div>
        </form>
      )}
    </View>
  );
};
