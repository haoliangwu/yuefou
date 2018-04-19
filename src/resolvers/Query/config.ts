import { getUserId, Context } from '../../utils'
import { GraphQLResolveInfo } from 'graphql';

/* 
获取共有全局配置
*/
function config(parent, args, ctx: Context, info?: GraphQLResolveInfo) {
  return {
    cos: {
      bucket: process.env.COS_BUCKET,
      region: process.env.COS_REGION,
      appId: process.env.COS_APP_ID,
    }
  }
}

export const configQuery = {
  config
}
