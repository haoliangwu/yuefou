import * as R from 'ramda';

import { Context, getUserId } from "../../utils";
import * as ERROR from '../../constants/error';
import { ActivityTaskCreateInput, ActivityTaskUpdateInput, ActivityUpdateInput, ProcessStatus } from '../../generated/prisma';
import { whenActivityExistedById } from '.';

/*
一个任务是否存在 
*/
export async function whenTaskExistedById(id, ctx: Context) {
  const isTaskExisted = await ctx.db.exists.ActivityTask({ id })

  if (!isTaskExisted) {
    return Promise.reject(ERROR.NO_EXISTED_ACTIVITY_TASK)
  }
}

/* 
当前用户是否是活动的创建者或参加者
*/
export async function isCurrentUserIsCreatorOrParticipant(id, ctx: Context) {
  const userId = getUserId(ctx)

  const isCurrentUser = { id: userId }
  const isCreatorOrParticipant = await ctx.db.exists.Activity({
    id,
    OR: [
      { creator: isCurrentUser },
      { participants_some: isCurrentUser }
    ]
  })

  if (!isCreatorOrParticipant) {
    return Promise.reject(ERROR.ONLY_BY_CREATOR_OR_PARTICIPANT)
  }
}

/* 
创建一个任务
*/
async function createTask(parent, { id, task }, ctx: Context, info) {
  await whenActivityExistedById(id, ctx)
  await isCurrentUserIsCreatorOrParticipant(id, ctx)

  const userId = getUserId(ctx)

  const { name } = task

  const data: ActivityTaskCreateInput = {
    name,
    status: 'INIT',
    assignee: {
      connect: { id: userId }
    },
    activity: {
      connect: { id }
    }
  }

  return ctx.db.mutation.createActivityTask({
    data
  }, info)
}

/* 
更新一个任务
*/
async function updateTask(parent, { id, task }, ctx: Context, info) {
  const { id: taskId, ...updateProps } = task

  await whenTaskExistedById(taskId, ctx)
  await isCurrentUserIsCreatorOrParticipant(id, ctx)

  const data = R.filter(R.complement(R.isNil), updateProps) as ActivityUpdateInput

  return ctx.db.mutation.updateActivityTask({
    data,
    where: {
      id: taskId
    }
  }, info)
}

/* 
更新一个任务
*/
async function updateTaskStatus(parent, { id, taskId, status = 'INIT' as ProcessStatus }, ctx: Context, info) {
  await whenTaskExistedById(taskId, ctx)
  await isCurrentUserIsCreatorOrParticipant(id, ctx)

  const data: ActivityUpdateInput = {
    status
  }

  return ctx.db.mutation.updateActivityTask({
    data,
    where: {
      id: taskId
    }
  }, info)
}

/* 
删除一个任务
*/
async function deleteTask(parent, { id, taskId }, ctx: Context, info) {
  await whenTaskExistedById(taskId, ctx)
  await isCurrentUserIsCreatorOrParticipant(id, ctx)

  return ctx.db.mutation.deleteActivityTask({
    where: { id: taskId }
  }, info)
}

/* 
指定任务委托人
*/
async function assignTask(parent, { id, taskId, assigneeId }, ctx: Context, info) {
  await whenTaskExistedById(taskId, ctx)
  await isCurrentUserIsCreatorOrParticipant(id, ctx)

  if (!assigneeId) {
    assigneeId = getUserId(ctx)
  }

  const data: ActivityTaskUpdateInput = {
    assignee: {
      connect: { id: assigneeId }
    }
  }

  return ctx.db.mutation.updateActivityTask({
    data,
    where: { id: taskId }
  }, info)
}

export const taskMutation = {
  createTask,
  updateTask,
  deleteTask,
  assignTask
}