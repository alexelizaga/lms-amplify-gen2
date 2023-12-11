import { CourseValues } from "@/types";
import { reqResBasedClient, runWithAmplifyServerContext } from "@/utils";
import { getCurrentUser } from "aws-amplify/auth/server";
import { GetServerSideProps, NextPage } from "next";

type Props = {
  course: CourseValues;
};

const CourseIdPage: NextPage<Props> = ({ course }) => {
  return (
    <div>
      <div>{course.courseId}</div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  params,
  req,
  res,
}) => {
  const { courseId = "" } = params as { courseId: string };
  try {
    const { userId } = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: (contextSpec) => getCurrentUser(contextSpec),
    });

    if (!userId) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    const course = await runWithAmplifyServerContext({
      nextServerContext: { request: req, response: res },
      operation: async (contextSpec) => {
        const { data: course } = await reqResBasedClient.models.Course.list(
          contextSpec,
          {
            filter: {
              and: [{ courseId: { eq: courseId } }, { userId: { eq: userId } }],
            },
          }
        );
        if (!course.length) return undefined;
        return JSON.parse(JSON.stringify(course[0]));
      },
    });

    if (!course) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    return { props: { course } };
  } catch (error) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
};

export default CourseIdPage;
