import { getUserId, Context } from '../../utils'

/* 
获取当前用户可见的所有活动
*/
function tasks(parent, args, ctx: Context, info) {
  const id = getUserId(ctx)

  return ctx.db.query.activityTasks({
    where: {
      assignee: { id }
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
  task
}
