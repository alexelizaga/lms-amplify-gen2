import React from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button, Flex, Input } from "@aws-amplify/ui-react";
import toast from "react-hot-toast";
import { Loader2, PlusCircle } from "lucide-react";

import { ChapterValues, CourseValues } from "@/types";
import { cn } from "@/utils";

import { ChaptersList } from "./chapters-list";

interface ChaptersFormProps {
  initialData: CourseValues;
}

const formSchema = z.object({
  title: z.string().min(1),
});

export const ChaptersForm = ({ initialData }: ChaptersFormProps) => {
  const router = useRouter();
  const [isCreating, setIsCreating] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [chapters, setChapters] = React.useState<ChapterValues[]>([]);

  React.useEffect(() => {
    getCourseChapters();
  }, []);

  const getCourseChapters = () => {
    axios
      .get<ChapterValues[]>(`/api/courses/${initialData.courseId}/chapters`)
      .then(({ data: chapters }) => {
        setChapters(chapters);
      });
  };

  const toggleCreating = () => setIsCreating((current) => !current);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  const { register } = form;
  const { isSubmitting, isValid, errors } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.post(`/api/courses/${initialData.courseId}/chapters`, {
        ...values,
        position: chapters?.length + 1,
      });
      toast.success("Chapter created");
      toggleCreating();
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  };

  const onReorder = async (updateData: { id: string; position: number }[]) => {
    try {
      setIsUpdating(true);

      await axios.put(`/api/courses/${initialData.courseId}/chapters/reorder`, {
        list: updateData,
      });
      toast.success("Chapters reordered");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsUpdating(false);
    }
  };

  const onEdit = (id: string) => {
    router.push(`/teacher/courses/${initialData.courseId}/chapters/${id}`);
  };

  return (
    <div className="relative mt-6 border bg-slate-100 rounded-md p-4">
      {isUpdating && (
        <div className="absolute h-full w-full bg-slate-500/20 top-0 right-0 rounded-md flex items-center justify-center">
          <Loader2 className="animate-spin h-6 w-6 text-sky-700" />
        </div>
      )}
      <div className="font-medium flex items-center justify-between">
        Chapters
        <Button onClick={toggleCreating} variation="link" size="small">
          {isCreating ? (
            <>Cancel</>
          ) : (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add
            </>
          )}
        </Button>
      </div>
      {isCreating && (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <Flex direction="column" gap="small">
            <Input
              backgroundColor="white"
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

          <Button
            size="small"
            disabled={!isValid}
            isLoading={isSubmitting}
            type="submit"
          >
            Create
          </Button>
        </form>
      )}
      {!isCreating && (
        <div
          className={cn(
            "text-sm mt-2",
            !chapters?.length && "text-slate-500 italic"
          )}
        >
          {!chapters?.length && "No chapters"}
          <ChaptersList
            onEdit={onEdit}
            onReorder={onReorder}
            items={(chapters as ChapterValues[]) ?? []}
          />
        </div>
      )}
      {!isCreating && (
        <p className="text-xs text-slate-500 mt-4">
          Drag and drop to reorder the chapters
        </p>
      )}
    </div>
  );
};
