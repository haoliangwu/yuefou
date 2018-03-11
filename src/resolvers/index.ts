import { Query } from './Query'
import { auth, activity } from './Mutation'
import { AuthPayload } from './AuthPayload'

export default {
  Query,
  Mutation: {
    ...auth,
    ...activity
  },
  AuthPayload,
}
