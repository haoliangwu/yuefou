import { getUserId, Context } from '../utils'

/* 
获取当前用户的详情
*/
function me(parent, args, ctx: Context, info) {
  const id = getUserId(ctx)

  return ctx.db.query.user({ where: { id } }, info)
}

/* 
获取当前用户可见的所有活动
*/
function activities(parent, args, ctx: Context, info) {
  const id = getUserId(ctx)

  return ctx.db.query.activities({
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
async function activity(parent, args, ctx: Context, info) {
  const { id } = args

  return await ctx.db.query.activity({
    where: {
      id
    }
  }, info)
}


export const Query = {
  me,
  activities,
  activity
}
