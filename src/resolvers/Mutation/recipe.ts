import * as R from 'ramda';

import { getUserId, Context } from '../../utils';
import { GraphQLResolveInfo } from 'graphql';
import * as ERROR from '../../constants/error';
import { RecipeCreateInput, RecipeUpdateInput, TagCreateWithoutRecipesInput } from '../../generated/prisma';
import { uploadMutation, removeUpload } from '../Mutation/upload';

const mergeCreatorMetaFactory = creatorId => R.map<any, TagCreateWithoutRecipesInput>(R.merge(R.__, {
  creator: {
    connect: {
      id: creatorId
    }
  }
}))

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

  const mergeCreatorMeta = mergeCreatorMetaFactory(userId)

  const data: RecipeCreateInput = {
    name,
    creator: {
      connect: { id: userId }
    },
    desc,
    time,
    tags: {
      connect: tagsMeta ? R.propOr([], 'connect', tagsMeta) : [],
      create: tagsMeta ? mergeCreatorMeta(R.propOr([], 'create', tagsMeta)) : []
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

  const userId = getUserId(ctx)
  const { name, desc, time } = recipe

  const mergeCreatorMeta = mergeCreatorMetaFactory(userId)

  let data = R.filter(R.complement(R.isNil), updateProps) as RecipeUpdateInput

  data = {
    ...data,
    tags: {
      disconnect: tagsMeta ? R.propOr([], 'disconnect', tagsMeta) : [],
      connect: tagsMeta ? R.propOr([], 'connect', tagsMeta) : [],
      create: tagsMeta ? mergeCreatorMeta(R.propOr([], 'create', tagsMeta)) : []
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
  await whenRecipeExistedById(id, ctx)
  await whenCurrentUserIsRecipeCreator(id, ctx)

  return ctx.db.mutation.deleteRecipe({
    where: { id }
  }, info)
}

/* 
上传菜谱缩略图
*/
async function uploadRecipePicture(parent, { id, file }, ctx: Context, info?: GraphQLResolveInfo) {
  await whenRecipeExistedById(id, ctx)
  await whenCurrentUserIsRecipeCreator(id, ctx)

  const namespace = 'shared/recipe'
  const recipe = await ctx.db.query.recipe({ where: { id } })

  if (recipe.avatar) {
    await removeUpload({ filename: recipe.avatar }, namespace)
  }

  const { path } = await uploadMutation.singleUpload(parent, { file, namespace }, ctx)

  return ctx.db.mutation.updateRecipe({
    data: {
      avatar: path
    },
    where: { id }
  }, info)
}

export const recipeMutation = {
  createRecipe,
  updateRecipe,
  deleteRecipe,
  uploadRecipePicture
}