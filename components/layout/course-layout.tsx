import Head from "next/head";
import { ScrollView, View, useTheme } from "@aws-amplify/ui-react";

import { CourseNavbar, CourseSidebar } from "@/components";
import { ChapterValues, CourseValues } from "@/types";

type Props = {
  isLoading?: boolean;
  children: JSX.Element | JSX.Element[];
  title: string;
  pageDescription: string;
  imageFullUrl?: string;
  course?: CourseValues;
  progressCount: number;
  chapters?: (ChapterValues & { isCompleted: boolean })[];
};

export const CourseLayout: React.FC<Props> = ({
  isLoading = false,
  children,
  title,
  pageDescription,
  imageFullUrl,
  course,
  progressCount = 0,
  chapters = [],
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

      <View
        as="nav"
        backgroundColor={tokens.colors.background.primary}
        className="h-[80px] md:pl-56 fixed inset-y-0 w-full z-10"
      >
        <CourseNavbar
          isLoading={isLoading}
          course={course}
          progressCount={progressCount}
          chapters={chapters}
        />
      </View>

      <nav className="hidden md:flex h-full w-56 flex-col fixed inset-y-0 z-10">
        <CourseSidebar
          isLoading={isLoading}
          course={course}
          progressCount={progressCount}
          chapters={chapters}
        />
      </nav>

      <main className="md:pl-56 pt-[80px] h-full">{children}</main>
    </ScrollView>
  );
};
