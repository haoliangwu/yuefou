import { Context } from '../../utils'

export const ActivityTaskPayload = {
  task: async ({ task: { id } }, args, ctx: Context, info) => {
    return ctx.db.query.activityTask({ where: { id } }, info)
  },
  activity: async ({ activity: { id } }, args, ctx: Context, info) => {
    return ctx.db.query.activity({ where: { id } }, info)
  },
}
