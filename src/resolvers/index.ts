import { Query } from './Query'
import { auth, activity, upload, task } from './Mutation'
import { AuthPayload, ActivityTaskPayload } from './Payload';

export default {
  Query,
  Mutation: {
    ...auth,
    ...activity,
    ...upload,
    ...task
  },
  AuthPayload,
  ActivityTaskPayload
}
