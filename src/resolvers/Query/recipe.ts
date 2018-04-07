import { getUserId, Context } from '../../utils';
import { GraphQLResolveInfo } from 'graphql';

/* 
获取当前用户可见的所有菜谱
*/
function recipes(parent, args, ctx: Context, info?: GraphQLResolveInfo) {
  const id = getUserId(ctx)

  return ctx.db.query.recipes({
    orderBy: "updatedAt_DESC",
    where: {
      creator: { id }
    }
  }, info)
}

/* 
获取当前用户可见的所有菜谱（分页）
*/
function recipesConnection(parent, { pagination = {} }, ctx: Context, info?) {
  const id = getUserId(ctx)

  return ctx.db.query.recipesConnection({
    ...pagination,
    orderBy: "updatedAt_DESC",
    where: {
      creator: { id }
    }
  }, info)
}

/* 
根据 id 获取菜谱详情
*/
async function recipe(parent, args, ctx: Context, info?) {
  const { id } = args

  return ctx.db.query.recipe({
    where: { id }
  }, info)
}

export const recipeQuery = {
  recipes,
  recipesConnection,
  recipe
}