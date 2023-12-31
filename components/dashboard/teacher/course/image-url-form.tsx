import React from "react";
import * as z from "zod";
import { CourseValues } from "@/types";
import { Button, View, useTheme } from "@aws-amplify/ui-react";
import { FilePlus2, Pencil, X } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import Image from "next/image";

import { SearchImage } from "../..";

interface ImageUrlFormProps {
  initialData: CourseValues;
}

const formSchema = z.object({
  imageUrl: z.string().min(1),
});

export const ImageUrlForm = ({ initialData }: ImageUrlFormProps) => {
  const { tokens } = useTheme();
  const router = useRouter();
  const [isEditing, setIsEditing] = React.useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

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
        Image
        <Button onClick={toggleEdit} variation="link" size="small">
          {isEditing && <X className="h-4 w-4" />}
          {!isEditing && !initialData.imageUrl && (
            <FilePlus2 className="h-4 w-4" />
          )}
          {!isEditing && initialData.imageUrl && <Pencil className="h-4 w-4" />}
        </Button>
      </div>
      {!isEditing &&
        (!initialData.imageUrl ? (
          <p className="text-sm mt-2 text-slate-500 italic">No image</p>
        ) : (
          <div className="relative aspect-video mt-2 overflow-hidden">
            <Image
              alt="Upload"
              fill
              className="object-cover rounded-md"
              src={initialData.imageUrl!}
            />
          </div>
        ))}
      {isEditing && (
        <div className="space-y-4 mt-4">
          <SearchImage onSelectedPhoto={onSubmit} />
        </div>
      )}
    </View>
  );
};
