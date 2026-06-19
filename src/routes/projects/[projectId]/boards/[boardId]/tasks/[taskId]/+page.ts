export const load = ({ params }) => {
  return {
    projectId: Number(params.projectId),
    boardId: Number(params.boardId),
    taskId: Number(params.taskId),
  }
}
