import { getUserId, Context } from '../../utils';
import { ActivityCreateInput, Activity } from '../../generated/prisma';

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
      status: "INIT",
      creator: {
        connect: { id: userId },
      },
      startedAt: now.toISOString(),
      endedAt: now.toISOString(),
      location: location
    }

    return ctx.db.mutation.createActivity(
      { data },
      info
    )
  },

  /* 
   参与一个活动
   */
  async attendActivity(parent, { id }, ctx: Context, info) {
    const userId = getUserId(ctx)

    const activity = await ctx.db.query.activities({
      where: {
        id,
        creator: {
          id: userId
        }
      },
    }, info)

    if (activity[0].creator.id === userId) {
      return activity[0]
    } else {
      return ctx.db.mutation.updateActivity({
        where: {
          id
        },
        data: {
          participants: {
            connect: {
              id: userId
            }
          }
        }
      }, info)
    }
  }
}