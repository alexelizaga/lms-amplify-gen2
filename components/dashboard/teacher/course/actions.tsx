import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import toast from "react-hot-toast";
import { Button } from "@aws-amplify/ui-react";
import { Trash } from "lucide-react";

import { useConfettiStore } from "@/hooks";
import { Modal } from "../..";

interface ActionsProps {
  disabled: boolean;
  courseId: string;
  isPublished: boolean;
  hasChapters: boolean;
}

export const Actions = ({
  disabled,
  courseId,
  isPublished,
  hasChapters,
}: ActionsProps) => {
  const router = useRouter();
  const confetti = useConfettiStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const onClick = async () => {
    try {
      setIsLoading(true);

      if (isPublished) {
        await axios.patch(`/api/courses/${courseId}/unpublish`);
        toast.success("Course unpublished");
      } else {
        await axios.patch(`/api/courses/${courseId}/publish`);
        toast.success("Course published");
        confetti.onOpen();
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

      await axios.delete(`/api/courses/${courseId}`);

      toast.success("Course deleted");
      router.push("/teacher/courses");
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
        <Trash className="h-4 w-4" />
      </Button>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {!hasChapters ? (
          <>
            <h1 className="text-2xl">Are you sure?</h1>
            <p>This action cannot be undone.</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl">Course has chapters</h1>
            <p>This action cannot be done.</p>
          </>
        )}

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
            disabled={hasChapters || isLoading}
            onClick={onDelete}
          >
            Continue
          </Button>
        </div>
      </Modal>
    </div>
  );
};
