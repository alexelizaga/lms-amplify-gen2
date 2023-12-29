import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import toast from "react-hot-toast";
import { Button } from "@aws-amplify/ui-react";
import { CheckCircle, XCircle } from "lucide-react";

import { useConfettiStore } from "@/hooks";

interface CourseProgressButtonProps {
  isLoading?: boolean;
  chapterId: string;
  courseId: string;
  isCompleted?: boolean;
  nextChapterId?: string;
}

export const CourseProgressButton = ({
  isLoading = false,
  chapterId,
  courseId,
  isCompleted,
  nextChapterId,
}: CourseProgressButtonProps) => {
  const router = useRouter();
  const confetti = useConfettiStore();

  const [isSummiting, setIsSummiting] = useState(false);

  const onClick = async () => {
    try {
      setIsSummiting(true);

      await axios.put(
        `/api/courses/${courseId}/chapters/${chapterId}/progress`,
        {
          isCompleted: !isCompleted,
        }
      );

      if (!isCompleted && !nextChapterId) {
        confetti.onOpen();
      }

      toast.success("Progress updated");

      if (!isCompleted && nextChapterId) {
        router.push(`/courses/${courseId}/chapters/${nextChapterId}`);
      } else {
        router.reload();
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSummiting(false);
    }
  };

  const Icon = isCompleted ? XCircle : CheckCircle;
  return (
    <Button
      isLoading={isLoading}
      disabled={isSummiting}
      type="button"
      variation={isCompleted ? undefined : "primary"}
      colorTheme={isCompleted ? undefined : "success"}
      size="small"
      width={180}
      onClick={onClick}
    >
      {isCompleted ? "Not completed" : "Mark as complete"}
      <Icon className="h-4 w-4 ml-2" />
    </Button>
  );
};
