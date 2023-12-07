import React from "react";
import { View, useTheme } from "@aws-amplify/ui-react";
import { IoMdClose } from "react-icons/io";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactElement | React.ReactElement[];
}

export const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  const { tokens } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="fixed inset-0 bg-gray-500 opacity-75"></div>

      <View
        color={tokens.colors.primary[100]}
        backgroundColor={tokens.colors.neutral[10]}
        className="relative p-8 z-10"
      >
        <button className="absolute top-0 right-0 p-4" onClick={onClose}>
          <IoMdClose className="h-[24px] w-[24px]" />
        </button>
        {children}
      </View>
    </div>
  );
};
