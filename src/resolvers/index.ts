import { userQuery, activityQuery, taskQuery } from './Query'
import { authMutation, activityMutation, uploadMutation, taskMutation, userMutation } from './Mutation'
import { AuthPayload } from './Payload';

export default {
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
  AuthPayload
  
}
