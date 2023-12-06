import React from "react";
import dynamic from "next/dynamic";

import "react-quill/dist/quill.snow.css";

interface EditorProps {
  onChange: (value: string) => void;
  value: string;
}

export const Editor = ({ onChange, value }: EditorProps) => {
  const ReactQuill = React.useMemo(
    () => dynamic(() => import("react-quill"), { ssr: false }),
    []
  );

  return (
    <div className="bg-white text-black">
      <ReactQuill theme="snow" value={value} onChange={onChange} />
    </div>
  );
};
