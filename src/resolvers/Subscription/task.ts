import { Context } from "../../utils";

const updatedTask = {
  subscribe: (parent, args, ctx: Context, info) => {
    return ctx.db.subscription.activityTask(
      {
        // see https://github.com/graphcool/prisma/issues/1734
        // where : {
        //   mutation_in: ['CREATED']
        // }
      },
      info,
    )
  }
}

export const taskSubscription = {
  updatedTask
}