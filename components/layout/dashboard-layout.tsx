import Head from "next/head";
import { ScrollView, View, useTheme } from "@aws-amplify/ui-react";

import { Sidebar } from "../dashboard/sidebar";
import { Navbar } from "../dashboard/navbar";

type Props = {
  children: JSX.Element | JSX.Element[];
  title: string;
  pageDescription: string;
  imageFullUrl?: string;
};

export const DashboardLayout: React.FC<Props> = ({
  children,
  title,
  pageDescription,
  imageFullUrl,
}) => {
  const { tokens } = useTheme();
  return (
    <ScrollView
      as="div"
      width="100vw"
      height="100vh"
      color={tokens.colors.primary[100]}
      backgroundColor={tokens.colors.background.primary}
    >
      <Head>
        <title>{title}</title>
        <meta name="description" content={pageDescription} />
        <meta name="og:title" content={title} />
        <meta name="og:description" content={pageDescription} />
        {imageFullUrl && <meta name="og:image" content={imageFullUrl} />}
      </Head>

      <nav className="h-[80px] md:pl-56 fixed inset-y-0 w-full z-50">
        <Navbar />
      </nav>

      <nav className="hidden md:flex h-full w-56 flex-col fixed inset-y-0 z-50">
        <Sidebar />
      </nav>

      <main className="md:pl-56 pt-[80px] h-full">{children}</main>
    </ScrollView>
  );
};
