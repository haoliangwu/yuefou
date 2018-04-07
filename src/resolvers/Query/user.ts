import { getUserId, Context } from '../../utils'
import { GraphQLResolveInfo } from 'graphql';
import { CacheScope } from 'apollo-cache-control';

/* 
获取当前用户的详情
*/
function me(parent, args, ctx: Context, info?: GraphQLResolveInfo) {
  const id = getUserId(ctx)

  return ctx.db.query.user({ where: { id } }, info)
}

export const userQuery = {
  me
}
