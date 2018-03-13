import { getUserId, Context } from '../utils'

export const Query = {
  /* 
   获取当前用户的详情
   */
  me(parent, args, ctx: Context, info) {
    const id = getUserId(ctx)
    
    return ctx.db.query.user({ where: { id } }, info)
  },

  /* 
   获取当前用户可见的所有活动
   */
  activities(parent, args, ctx: Context, info) {
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
}
