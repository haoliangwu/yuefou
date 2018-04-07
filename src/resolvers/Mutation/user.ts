import { Context, getUserId } from "../../utils";
import * as ERROR from '../../constants/error';
import { UserUpdateInput } from "../../generated/prisma";
import * as R from 'ramda'

import { uploadMutation } from '../Mutation/upload';
import { removeUpload } from "../Mutation/upload";

export async function isUserExisted(id, ctx: Context) {
  const isExisted = await ctx.db.exists.User({ id })

  if (!isExisted) {
    return Promise.reject(ERROR.NO_EXISTED_USER)
  }
}

async function updateUser(parent, { user }, ctx: Context, info?) {
  const userId = getUserId(ctx)

  const data = R.filter(R.complement(R.isNil), user) as UserUpdateInput

  return ctx.db.mutation.updateUser({
    data,
    where: { id: userId }
  }, info)
}

async function uploadAvatar(parent, { file }, ctx: Context, info?) {
  const userId = getUserId(ctx)

  const user = await ctx.db.query.user({ where: { id: userId } })

  if (user.avatar) {
    await removeUpload({ filename: user.avatar }, userId)
  }

  const { path } = await uploadMutation.singleUpload(parent, { file }, ctx, info)

  const data: UserUpdateInput = {
    avatar: path
  }

  return ctx.db.mutation.updateUser({
    data,
    where: { id: userId }
  }, info)
}

export const userMutation = {
  updateUser,
  uploadAvatar
}