import { IconType } from "react-icons";
import * as ReactIcons from "react-icons/fc";

export const DynamicFcIcon = ({
  name,
  size,
}: {
  name: string;
  size: number;
}) => {
  const Icons: { [key: string]: IconType } = ReactIcons;
  const IconComponent: IconType | undefined = Icons[name];

  if (!IconComponent) {
    return <></>;
  }

  return <IconComponent size={size} />;
};
