import { userQuery, activityQuery, taskQuery, recipeQuery, tagQuery  } from './Query'
import { authMutation, activityMutation, uploadMutation, taskMutation, userMutation, recipeMutation, tagMutation } from './Mutation'
import { AuthPayload } from './Payload';
import { taskSubscription } from './Subscription/task';

export default {
  // root type
  Query: {
    ...activityQuery,
    ...taskQuery,
    ...userQuery,
    ...recipeQuery,
    ...tagQuery
  },
  Mutation: {
    ...authMutation,
    ...activityMutation,
    ...uploadMutation,
    ...taskMutation,
    ...userMutation,
    ...recipeMutation,
    ...tagMutation
  },
  Subscription: {
    ...taskSubscription
  },
  // app type
  AuthPayload
}
