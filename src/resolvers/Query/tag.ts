import { getUserId, Context } from '../../utils';
import { GraphQLResolveInfo } from 'graphql';

/* 
查询所有标签
*/
async function tags(parent, { category }, ctx: Context, info?: GraphQLResolveInfo) {
  const userId = getUserId(ctx)

  const tags = await ctx.db.query.tags({
    where: {
      category
    }
  }, info)

  return tags
}

/* 
查询当前用户所见所有标签
*/
function myRecipeTags(parent, args, ctx: Context, info?: GraphQLResolveInfo) {
  const userId = getUserId(ctx)

  return ctx.db.query.tags({
    where: {
      category: 'RECIPE',
      OR: [
        {
          creator: { id: userId }
        },
        {
          default: true
        },
      ]
    }
  }, info)
}

/* 
根据 id 获取标签详情
*/
function tag(parent, args, ctx: Context, info?: GraphQLResolveInfo) {
  const { id } = args

  return ctx.db.query.tag({
    where: {
      id
    }
  }, info)
}

export const tagQuery = {
  tags,
  myRecipeTags,
  tag,
}