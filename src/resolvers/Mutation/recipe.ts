import * as R from 'ramda';

import { getUserId, Context } from '../../utils';
import { GraphQLResolveInfo } from 'graphql';
import * as ERROR from '../../constants/error';
import { RecipeCreateInput, RecipeUpdateInput } from '../../generated/prisma';
import { whenActivityExistedById } from '.';

/* 
一个菜谱是否存在
*/
export async function whenRecipeExistedById(id, ctx: Context) {
  const isExistedRecipe = await ctx.db.exists.Recipe({ id })

  if (!isExistedRecipe) return Promise.reject(ERROR.NO_EXISTED_RECIPE)
}

/* 
当前用户是菜谱的创建者
*/
export async function whenCurrentUserIsRecipeCreator(id, ctx: Context) {
  const userId = getUserId(ctx)

  const isCreator = await ctx.db.exists.Recipe({
    id,
    creator: {
      id: userId
    }
  })

  if (!isCreator) {
    return Promise.reject(ERROR.ONLY_BY_CREATOR)
  }
}

/* 
创建一个菜谱
*/
async function createRecipe(parent, { recipe, tagsMeta }, ctx: Context, info?: GraphQLResolveInfo) {
  const userId = getUserId(ctx)

  const { name, desc, time } = recipe

  const data: RecipeCreateInput = {
    name,
    creator: {
      connect: { id: userId }
    },
    desc,
    time,
    tags: {
      connect: tagsMeta ? R.propOr([], 'connect', tagsMeta) : [],
      create: tagsMeta ? R.propOr([], 'create', tagsMeta) : []
    }
  }

  return ctx.db.mutation.createRecipe({ data }, info)
}

/* 
更新一个菜谱
*/
async function updateRecipe(parent, { recipe, tagsMeta }, ctx: Context, info?: GraphQLResolveInfo) {
  const { id, ...updateProps } = recipe

  await whenRecipeExistedById(id, ctx)
  await whenCurrentUserIsRecipeCreator(id, ctx)

  const { name, desc, time, tags = [] } = recipe

  let data = R.filter(R.complement(R.isNil), updateProps) as RecipeUpdateInput

  data = {
    ...data,
    tags: {
      disconnect: tagsMeta ? R.propOr([], 'disconnect', tagsMeta) : [],
      connect: tagsMeta ? R.propOr([], 'connect', tagsMeta) : [],
      create: tagsMeta ? R.propOr([], 'create', tagsMeta) : []
    }
  }

  return ctx.db.mutation.updateRecipe({
    data,
    where: { id }
  }, info)
}

/* 
删除一个菜谱
*/
async function deleteRecipe(parent, { id }, ctx: Context, info?: GraphQLResolveInfo) {
  await whenActivityExistedById(id, ctx)
  await whenCurrentUserIsRecipeCreator(id, ctx)

  return await ctx.db.mutation.deleteRecipe({
    where: { id }
  }, info)
}

export const recipeMutation = {
  createRecipe,
  updateRecipe,
  deleteRecipe
}