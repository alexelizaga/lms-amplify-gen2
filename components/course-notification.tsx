import React from "react";
import { Alert } from "@aws-amplify/ui-react";

interface NotificationProps {
  isVisible?: boolean;
  isCompleted?: boolean;
  isLocked?: boolean;
}

export const CourseNotification = ({
  isVisible = false,
  isCompleted = false,
  isLocked = false,
}: NotificationProps) => {
  return (
    <>
      {isVisible && isCompleted && (
        <div className="flex flex-col w-full">
          <div className="rounded-md overflow-hidden">
            <Alert
              variation="success"
              isDismissible={false}
              hasIcon={true}
              heading=""
            >
              You already completed this chapter.
            </Alert>
          </div>
        </div>
      )}
      {isVisible && isLocked && (
        <div className="flex flex-col w-full">
          <div className="rounded-md overflow-hidden">
            <Alert
              variation="warning"
              isDismissible={false}
              hasIcon={true}
              heading=""
            >
              You need to purchase this course to see this chapter.
            </Alert>
          </div>
        </div>
      )}
    </>
  );
};
