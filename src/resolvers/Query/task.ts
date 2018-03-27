import { getUserId, Context } from '../../utils'

/* 
获取当前用户可见的所有活动
*/
function tasks(parent, args, ctx: Context, info) {
  const id = getUserId(ctx)

  return ctx.db.query.activityTasks({
    orderBy: "updatedAt_DESC",
    where: {
      OR: [
        { assignee: { id } },
        { activity: { participants_some: { id } } }
      ]
    },
  }, info)
}

/* 
获取当前用户可见的所有活动（分页）
*/
function tasksConnection(parent, { pagination = {} }, ctx: Context, info) {
  const id = getUserId(ctx)

  return ctx.db.query.activityTasksConnection({
    ...pagination,
    orderBy: "updatedAt_DESC",
    where: {
      OR: [
        { assignee: { id } },
        { activity: { participants_some: { id } } }
      ]
    },
  }, info)
}

/* 
根据 id 获取活动详情
*/
function task(parent, args, ctx: Context, info) {
  const { id } = args

  return ctx.db.query.activityTask({
    where: {
      id
    }
  }, info)
}


export const taskQuery = {
  tasks,
  tasksConnection,
  task
}
