export const load = ({ params }) => {
  return {
    courseId: Number(params.courseId),
    lectureId: Number(params.lectureId),
  }
}
