import * as R from 'ramda';

import { getUserId, Context } from '../../utils';
import { ActivityCreateInput, Activity, ActivityWhereUniqueInput, ActivityUpdateInput } from '../../generated/prisma';
import * as ERROR from '../../constants/error';

import { taskMutation } from './task';

/* 
一个活动是否存在
*/
export async function whenActivityExistedById(id, ctx: Context) {
  const isExistedActivity = await ctx.db.exists.Activity({ id })

  if (!isExistedActivity) {
    return Promise.reject(ERROR.NO_EXISTED_ACTIVITY)
  }
}

/* 
当前用户是活动的创建者
*/
export async function whenCurrentUserIsActivityCreator(id, ctx: Context) {
  const userId = getUserId(ctx)

  const isCreator = await ctx.db.exists.Activity({
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
创建一个活动 
*/
function createActivity(parent, { activity, tasksMeta, recipesMeta }, ctx: Context, info?) {
  const userId = getUserId(ctx)

  const { title, location, type, desc, startedAt, endedAt } = activity

  const now = new Date()

  const data: ActivityCreateInput = {
    title,
    desc,
    status: 'INIT',
    creator: {
      connect: { id: userId },
    },
    type: type || 'HOST',
    startedAt: startedAt || now.toISOString(),
    endedAt: endedAt || now.toISOString(),
    location: location || 'somewhere',
    participants: {
      create: []
    }
  }

  switch (data.type) {
    case 'HOST':
      data.recipes = {
        connect: recipesMeta ? R.propOr([], 'connect', recipesMeta) : []
      }
      break
    case 'TASK':
      data.tasks = {
        create: tasksMeta ? R.propOr([], 'create', tasksMeta) : []
      }
      break
    case 'POTLUCK':
    default:
      break
  }

  return ctx.db.mutation.createActivity({ data }, info)
}

/* 
更新一个活动
*/
async function updateActivity(parent, { activity, tasksMeta, recipesMeta }, ctx: Context, info?) {
  const { id, ...updateProps } = activity

  await whenActivityExistedById(id, ctx)
  await whenCurrentUserIsActivityCreator(id, ctx)

  const originActivity = await ctx.db.query.activity({ where: { id } })

  const data = R.filter(R.complement(R.isNil), updateProps) as ActivityUpdateInput

  switch (originActivity.type) {
    case 'HOST':
      // TODO 更新菜单
      data.recipes = {
        connect: recipesMeta ? R.propOr([], 'connect', recipesMeta) : [],
        disconnect: recipesMeta ? R.propOr([], 'disconnect', recipesMeta) : []
      }
      break
    case 'TASK':
      // 批量删除任务
      if (tasksMeta && tasksMeta.delete && tasksMeta.delete.length > 0) {
        await ctx.db.mutation.deleteManyActivityTasks({
          where: {
            id_in: tasksMeta.delete
          }
        })
      }

      // 批量更新任务
      if (tasksMeta && tasksMeta.update && tasksMeta.update.length > 0) {
        await Promise.all(tasksMeta.update.map(task => {
          return taskMutation.updateTask(parent, { id: activity.id, task }, ctx)
        }))
      }

      data.tasks = {
        create: tasksMeta ? R.propOr([], 'create', tasksMeta) : []
      }

      break
    case 'POTLUCK':
    default:
      break
  }

  return ctx.db.mutation.updateActivity({
    data,
    where: { id }
  }, info)
}

/* 
删除一个活动
*/
async function deleteActivity(parent, { id }, ctx: Context, info?) {
  await whenActivityExistedById(id, ctx)
  await whenCurrentUserIsActivityCreator(id, ctx)

  return await ctx.db.mutation.deleteActivity({
    where: { id }
  }, info)
}

/* 
参与一个活动
*/
async function attendActivity(parent, { id }, ctx: Context, info?) {
  const userId = getUserId(ctx)

  const isCreator = await ctx.db.exists.Activity({
    id,
    creator: {
      id: userId
    }
  })

  if (isCreator) {
    return new Error(ERROR.NO_INVITE_SELF)
  } else {
    const isParticipant = await ctx.db.exists.Activity({
      id,
      participants_some: {
        id: userId
      }
    })


    if (isParticipant) {
      return new Error(ERROR.NO_DUPLICATE_ATTEND)
    } else {

      const where: ActivityWhereUniqueInput = {
        id
      }

      const data: ActivityUpdateInput = {
        participants: {
          connect: {
            id: userId
          }
        }
      }

      return ctx.db.mutation.updateActivity({ where, data }, info)
    }
  }
}

/* 
退出一个活动
*/
async function quitActivity(parent, { id }, ctx: Context, info?) {
  const userId = getUserId(ctx)

  const isExitedActivity = await ctx.db.exists.Activity({
    id,
    participants_some: {
      id: userId
    }
  })

  const where: ActivityWhereUniqueInput = {
    id
  }

  const data: ActivityUpdateInput = {
    participants: {
      disconnect: {
        id: userId
      }
    }
  }

  if (isExitedActivity) {
    return ctx.db.mutation.updateActivity({ where, data }, info)
  } else {
    return new Error(ERROR.IS_NOT_PARTICIPANT)
  }
}

export const activityMutation = {
  createActivity,
  deleteActivity,
  updateActivity,
  attendActivity,
  quitActivity
}