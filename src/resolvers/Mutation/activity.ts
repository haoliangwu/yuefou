import { getUserId, Context } from '../../utils';
import { ActivityCreateInput, Activity, ActivityWhereUniqueInput, ActivityUpdateInput } from '../../generated/prisma';
import * as ERROR from '../../constants/error';

export const activity = {
  /*
   创建一个活动 
   */
  createActivity(parent, args, ctx: Context, info) {
    const userId = getUserId(ctx)

    const { title, location, type } = args

    const now = new Date()

    const data: ActivityCreateInput = {
      title,
      type,
      status: 'INIT',
      creator: {
        connect: { id: userId },
      },
      startedAt: now.toISOString(),
      endedAt: now.toISOString(),
      location: location
    }

    return ctx.db.mutation.createActivity({ data }, info)
  },

  /* 
   参与一个活动
   */
  async attendActivity(parent, { id }, ctx: Context, info) {
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
  },

  /* 
   退出一个活动
   */
  async quitActivity(parent, { id }, ctx: Context, info) {
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
}