import React from "react";
import { useRouter } from "next/router";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { Pencil } from "lucide-react";
import { Button, Flex, Input, View, useTheme } from "@aws-amplify/ui-react";

import { cn } from "@/utils/cn";
import { formatPrice } from "@/utils/format";
import { CourseValues } from "@/types";

interface PriceFormProps {
  initialData: CourseValues;
}

const formSchema = z.object({
  price: z.coerce.number(),
});

export const PriceForm = ({ initialData }: PriceFormProps) => {
  const { tokens } = useTheme();
  const router = useRouter();
  const [isEditing, setIsEditing] = React.useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      price: initialData?.price ?? undefined,
    },
  });

  const { register } = form;
  const { isSubmitting, isValid, errors } = form.formState;

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
        Price
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
            !initialData.price && "text-slate-500 italic"
          )}
        >
          {initialData.price === null
            ? "No price"
            : formatPrice(initialData.price ?? 0)}
        </p>
      )}
      {isEditing && (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <Flex direction="column" gap="small">
            <Input
              id="price"
              type="number"
              step={0.01}
              hasError={!!errors.price}
              disabled={isSubmitting}
              placeholder="Set a price for your course"
              {...register("price")}
            />
            {errors.price?.message && (
              <p className="text-sm text-red-800">{errors.price?.message}</p>
            )}
          </Flex>
          <div className="flex items-center gap-x-2">
            <Button
              variation="link"
              disabled={!isValid}
              isLoading={isSubmitting}
              type="submit"
              size="small"
            >
              Save
            </Button>
          </div>
        </form>
      )}
    </View>
  );
};
