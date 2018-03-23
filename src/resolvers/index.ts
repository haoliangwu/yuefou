import { userQuery, activityQuery, taskQuery } from './Query'
import { authMutation, activityMutation, uploadMutation, taskMutation, userMutation } from './Mutation'
import { AuthPayload } from './Payload';
import { taskSubscription } from './Subscription/task';

export default {
  // root type
  Query: {
    ...activityQuery,
    ...taskQuery,
    ...userQuery
  },
  Mutation: {
    ...authMutation,
    ...activityMutation,
    ...uploadMutation,
    ...taskMutation,
    ...userMutation
  },
  Subscription: {
    ...taskSubscription
  },
  // app type
  AuthPayload
}
