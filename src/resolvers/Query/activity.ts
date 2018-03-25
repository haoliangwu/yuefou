import { getUserId, Context } from '../../utils'

/* 
获取当前用户可见的所有活动
*/
function activities(parent, args, ctx: Context, info) {
  const id = getUserId(ctx)

  return ctx.db.query.activities({
    orderBy: "updatedAt_DESC",
    where: {
      OR: [
        {
          creator: {
            id
          }
        },
        {
          participants_some: {
            id
          }
        }
      ]
    },
  }, info)
}

/* 
获取当前用户可见的所有活动（分页）
*/
function activitiesConnection(parent, { pagination = {} }, ctx: Context, info) {
  const id = getUserId(ctx)

  return ctx.db.query.activitiesConnection({
    ...pagination,
    orderBy: "updatedAt_DESC",
    where: {
      OR: [
        {
          creator: {
            id
          }
        },
        {
          participants_some: {
            id
          }
        }
      ]
    },
  }, info)
}

/* 
根据 id 获取活动详情
*/
function activity(parent, args, ctx: Context, info) {
  const { id } = args

  return ctx.db.query.activity({
    where: {
      id
    }
  }, info)
}


export const activityQuery = {
  activities,
  activitiesConnection,
  activity
}
