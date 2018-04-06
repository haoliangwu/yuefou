import { userQuery, activityQuery, taskQuery, recipeMutation } from './Query'
import { authMutation, activityMutation, uploadMutation, taskMutation, userMutation, recipeQuery } from './Mutation'
import { AuthPayload } from './Payload';
import { taskSubscription } from './Subscription/task';

export default {
  // root type
  Query: {
    ...activityQuery,
    ...taskQuery,
    ...userQuery,
    ...recipeQuery
  },
  Mutation: {
    ...authMutation,
    ...activityMutation,
    ...uploadMutation,
    ...taskMutation,
    ...userMutation,
    ...recipeMutation
  },
  Subscription: {
    ...taskSubscription
  },
  // app type
  AuthPayload
}
