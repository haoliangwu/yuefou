import { Query } from './Query'
import { auth, activity, upload, task } from './Mutation'
// import { AuthPayload } from './AuthPayload'

export default {
  Query,
  Mutation: {
    ...auth,
    ...activity,
    ...upload,
    ...task
  },
  // AuthPayload,
}
