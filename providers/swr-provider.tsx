import { SWRConfig } from "swr";

type Props = {
  children: JSX.Element | JSX.Element[];
};

export const SWRProvider: React.FC<Props> = ({ children }) => {
  return <SWRConfig>{children}</SWRConfig>;
};
