export const load = ({ params }) => {
  return {
    courseId: Number(params.courseId),
    groupId: Number(params.groupId),
  }
}
