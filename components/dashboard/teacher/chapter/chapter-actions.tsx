import { useState } from "react";
import { Trash } from "lucide-react";
import toast from "react-hot-toast";

import axios from "axios";
import { useRouter } from "next/router";
import { Button } from "@aws-amplify/ui-react";
import { Modal } from "../..";

interface ChapterActionsProps {
  disabled: boolean;
  courseId: string;
  chapterId: string;
  isPublished: boolean;
}

export const ChapterActions = ({
  disabled,
  courseId,
  chapterId,
  isPublished,
}: ChapterActionsProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const onClick = async () => {
    try {
      setIsLoading(true);

      if (isPublished) {
        await axios.patch(
          `/api/courses/${courseId}/chapters/${chapterId}/unpublish`
        );
        toast.success("Chapter unpublished");
      } else {
        await axios.patch(
          `/api/courses/${courseId}/chapters/${chapterId}/publish`
        );
        toast.success("Chapter published");
      }
      router.reload();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setIsLoading(true);
      await axios.delete(`/api/courses/${courseId}/chapters/${chapterId}`);

      toast.success("Chapter deleted");
      router.reload();
      router.push(`/teacher/courses/${courseId}`);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-x-2">
      <Button onClick={onClick} disabled={disabled || isLoading} size="small">
        {isPublished ? "Unpublish" : "Publish"}
      </Button>
      <Button size="small" disabled={isLoading} onClick={openModal}>
        <Trash className="h-5 w-5" />
      </Button>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <h1 className="text-2xl">Are you sure?</h1>
        <p>This action cannot be undone.</p>
        <div className="flex items-center gap-2 mt-4">
          <Button
            size="small"
            isFullWidth
            disabled={isLoading}
            onClick={closeModal}
          >
            Cancel
          </Button>
          <Button
            size="small"
            variation="primary"
            isFullWidth
            disabled={isLoading}
            onClick={onDelete}
          >
            Continue
          </Button>
        </div>
      </Modal>
    </div>
  );
};
