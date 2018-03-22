import { Query } from './Query'
import { auth, activity, upload, task, user } from './Mutation'
import { AuthPayload } from './Payload';

export default {
  Query,
  Mutation: {
    ...auth,
    ...activity,
    ...upload,
    ...task,
    ...user
  },
  AuthPayload
  
}
