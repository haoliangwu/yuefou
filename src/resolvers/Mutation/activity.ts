import { getUserId, Context } from '../../utils';
import { ActivityCreateInput, Activity, ActivityWhereUniqueInput, ActivityUpdateInput } from '../../generated/prisma';
import * as ERROR from '../../constants/error';

import * as R from 'ramda';

/*
创建一个活动 
*/
function createActivity(parent, { activity }, ctx: Context, info) {
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
    location: location || 'somewhere'
  }

  return ctx.db.mutation.createActivity({ data }, info)
}

/* 
更新一个活动
*/
async function updateActivity(parent, { activity }, ctx: Context, info) {
  const userId = getUserId(ctx)

  const { id, ...updateProps } = activity

  const originActivity = await ctx.db.query.activity({
    where: { id }
  })

  if (originActivity) {
    const isCreator = await ctx.db.exists.Activity({
      id,
      creator: {
        id: userId
      }
    })

    if (isCreator) {
      const data = R.filter(R.complement(R.isNil), updateProps) as ActivityUpdateInput

      return ctx.db.mutation.updateActivity({
        data,
        where: { id }
      }, info)
    } else {
      throw new Error(ERROR.ONLY_BY_CREATOR)
    }
  } else {
    throw new Error(ERROR.NO_EXISTED_ACTIVITY)
  }
}

/* 
删除一个活动
*/
async function deleteActivity(parent, { id }, ctx: Context, info) {
  const userId = getUserId(ctx)

  const activity = await ctx.db.query.activity({
    where: { id }
  })

  if (activity) {
    const isCreator = await ctx.db.exists.Activity({
      id,
      creator: {
        id: userId
      }
    })

    if (isCreator) {
      return await ctx.db.mutation.deleteActivity({
        where: { id }
      }, info)
    } else {
      throw new Error(ERROR.ONLY_BY_CREATOR)
    }
  } else {
    throw new Error(ERROR.NO_EXISTED_ACTIVITY)
  }
}

/* 
参与一个活动
*/
async function attendActivity(parent, { id }, ctx: Context, info) {
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
async function quitActivity(parent, { id }, ctx: Context, info) {
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

export const activity = {
  createActivity,
  deleteActivity,
  updateActivity,
  attendActivity,
  quitActivity
}