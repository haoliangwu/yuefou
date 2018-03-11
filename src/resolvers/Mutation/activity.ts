import { getUserId, Context } from '../../utils';
import { ActivityCreateInput } from '../../generated/prisma';

export const activity = {
  async createActivity(parent, args, ctx: Context, info) {
    const userId = getUserId(ctx)

    const { title, startDate, endDate, location } = args

    const now = new Date()

    const data: ActivityCreateInput = {
      title,
      type: "HOST",
      status: "INIT",
      creator: {
        connect: { id: userId },
      },
      startedAt: startDate || now.toISOString(),
      endedAt: endDate || now.toISOString(),
      location: {
        create: {
          name: location
        }
      }
    }

    return ctx.db.mutation.createActivity(
      { data },
      info
    )
  },
}