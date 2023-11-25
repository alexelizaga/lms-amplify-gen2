import { BsTerminalFill } from "react-icons/bs";

export const Logo = () => {
  return (
    <div className="flex items-center gap-3">
      <BsTerminalFill size={24} />
      <div className="text-xl">Brocode</div>
    </div>
  );
};
