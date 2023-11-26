const CourseIdPage = ({ params }: { params: { courseId: string } }) => {
  return (
    <div>
      <div>CourseId: {params.courseId}</div>
    </div>
  );
};

export default CourseIdPage;
