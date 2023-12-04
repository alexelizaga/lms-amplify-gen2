import React from "react";
import dynamic from "next/dynamic";

import "react-quill/dist/quill.bubble.css";

interface PreviewProps {
  value: string;
}

export const Preview = ({ value }: PreviewProps) => {
  const ReactQuill = React.useMemo(
    () => dynamic(() => import("react-quill"), { ssr: false }),
    []
  );

  return (
    <div className="mx-[-15px] my-[-12px]">
      <ReactQuill theme="bubble" value={value} readOnly />
    </div>
  );
};
