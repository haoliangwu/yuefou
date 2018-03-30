import { getUserId, Context } from '../../utils'
import { GraphQLResolveInfo } from 'graphql';
import { CacheScope } from 'apollo-cache-control';

/* 
获取当前用户可见的所有活动
*/
function tasks(parent, args, ctx: Context, info?: GraphQLResolveInfo) {
  const id = getUserId(ctx)

  info.cacheControl.setCacheHint({ maxAge: 60 });

  return ctx.db.query.activityTasks({
    orderBy: "updatedAt_DESC",
    where: {
      OR: [
        {
          activity: {
            OR: [
              { participants_some: { id } },
              { creator: { id } }
            ]
          }
        },
        { assignee: { id } },
      ]
    },
  }, info)
}

/* 
获取当前用户可见的所有活动（分页）
*/
function tasksConnection(parent, { pagination = {} }, ctx: Context, info?) {
  const id = getUserId(ctx)

  return ctx.db.query.activityTasksConnection({
    ...pagination,
    orderBy: "updatedAt_DESC",
    where: {
      OR: [
        {
          activity: {
            OR: [
              { participants_some: { id } },
              { creator: { id } }
            ]
          }
        },
        { assignee: { id } },
      ]
    },
  }, info)
}

/* 
根据 id 获取活动详情
*/
function task(parent, args, ctx: Context, info?) {
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
