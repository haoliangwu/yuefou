import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
import { Context } from '../../utils'
import { NO_EXISTED_USER, INVALID_PASSWORD } from '../../constants/error';

export const auth = {
  /*
   用户注册 
   */
  async signup(parent, args, ctx: Context, info) {
    const password = await bcrypt.hash(args.password, 10)
    const user = await ctx.db.mutation.createUser({
      data: { ...args, password },
    })

    return {
      token: jwt.sign({ userId: user.id }, process.env.APP_SECRET),
      user,
    }
  },

  /*
   用户登录
   */
  async login(parent, { email, password }, ctx: Context, info) {
    const user = await ctx.db.query.user({ where: { email } })
    if (!user) {
      throw new Error(NO_EXISTED_USER)
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      throw new Error(INVALID_PASSWORD)
    }

    return {
      token: jwt.sign({ userId: user.id }, process.env.APP_SECRET),
      user,
    }
  },
}
