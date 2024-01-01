import React from "react";
import { useRouter } from "next/router";
import axios from "axios";
import toast from "react-hot-toast";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Pencil, Save, X } from "lucide-react";
import { Button, Flex, View, useTheme } from "@aws-amplify/ui-react";

import { cn } from "@/utils/cn";
import { Combobox } from "@/components/combo-box";
import { CourseValues } from "@/types";

interface CategoryFormProps {
  initialData: CourseValues;
  options?: { label: string; id: string }[];
}

const formSchema = z.object({
  categoryCoursesId: z.string().min(1),
});

export const CategoryForm = ({ initialData, options }: CategoryFormProps) => {
  const { tokens } = useTheme();
  const router = useRouter();
  const [isEditing, setIsEditing] = React.useState(false);
  const [isChange, setIsChange] = React.useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryCoursesId: initialData?.categoryCoursesId ?? "",
    },
  });

  const { setValue } = form;
  const { isSubmitting, isValid, errors } = form.formState;

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

  const selectedOption = React.useMemo(() => {
    return options?.find(
      (option) => option.id === initialData.categoryCoursesId
    );
  }, [initialData.categoryCoursesId, options]);

  return (
    <View
      color={tokens.colors.primary[100]}
      backgroundColor={tokens.colors.neutral[10]}
      className="mt-6 border rounded-md p-4"
    >
      <div className="font-medium flex items-center justify-between">
        Category
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
            !initialData.categoryCoursesId && "text-slate-500 italic"
          )}
        >
          {selectedOption?.label ?? "No category"}
        </p>
      )}
      {isEditing && (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <Flex direction="column" gap="small">
            <Combobox
              options={options}
              onChange={(value) => {
                setValue("categoryCoursesId", value, {
                  shouldValidate: true,
                  shouldTouch: true,
                });
                setIsChange(value !== initialData.categoryCoursesId);
              }}
            />
            {errors.categoryCoursesId?.message && (
              <p className="text-sm text-red-800">
                {errors.categoryCoursesId?.message}
              </p>
            )}
          </Flex>
          <div className="flex items-center gap-x-2">
            <Button
              type="submit"
              variation="primary"
              size="small"
              isDisabled={!isValid || !isChange}
              isLoading={isSubmitting}
              width={85}
              height={35}
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
