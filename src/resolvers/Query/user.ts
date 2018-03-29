import { getUserId, Context } from '../../utils'

/* 
获取当前用户的详情
*/
function me(parent, args, ctx: Context, info?) {
  const id = getUserId(ctx)

  return ctx.db.query.user({ where: { id } }, info)
}

export const userQuery = {
  me
}
