import * as R from 'ramda';

import { getUserId, Context } from '../../utils';
import { GraphQLResolveInfo } from 'graphql';
import * as ERROR from '../../constants/error';
import { TagCreateInput, TagUpdateInput } from '../../generated/prisma';

/* 
一个标签是否存在
*/
export async function whenTagExistedById(id, ctx: Context) {
  const isExistedTag = await ctx.db.exists.Tag({ id })

  if (!isExistedTag) return Promise.reject(ERROR.NO_EXISTED_TAG)
}

/* 
当前用户是标签的创建者
*/
export async function whenCurrentUserisTagCreator(id, ctx: Context) {
  const userId = getUserId(ctx)

  const isCreator = await ctx.db.exists.Tag({
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
是否是默认标签
*/
export async function whenTagIsNotDefault(id, ctx: Context) {
  const tag = await ctx.db.query.tag({ where: id })

  if (tag.default) return Promise.reject(ERROR.NO_DELETE_DEFAULT_TAG)
}

async function createTag(parent, { tag }, ctx: Context, info?: GraphQLResolveInfo) {
  const userId = getUserId(ctx)

  const { name, category } = tag

  const data: TagCreateInput = {
    name,
    category,
    creator: {
      connect: { id: userId }
    },
    default: false
  }

  console.log(data);

  return ctx.db.mutation.createTag({ data }, info)
}

async function updateTag(parent, { tag }, ctx: Context, info?: GraphQLResolveInfo) {
  const { id, ...updateProps } = tag

  await whenTagExistedById(id, ctx)
  await whenCurrentUserisTagCreator(id, ctx)

  const data = R.filter(R.complement(R.isNil), updateProps) as TagUpdateInput

  return ctx.db.mutation.updateTag({
    data,
    where: { id }
  }, info)

}

async function deleteTag(parent, { id }, ctx: Context, info?: GraphQLResolveInfo) {
  await whenTagExistedById(id, ctx)
  await whenCurrentUserisTagCreator(id, ctx)
  await whenTagIsNotDefault(id, ctx)

  return ctx.db.mutation.deleteTag({
    where: { id }
  }, info)
}

export const tagMutation = {
  createTag,
  updateTag,
  deleteTag
}