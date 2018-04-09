import * as R from 'ramda';
import { ID_Input } from '../generated/prisma';

export const propId = R.prop('id')

export const mapToId = R.map(propId)
export const mapPickIdProp = R.map(R.pick(['id']))

export const pickConnectUpdateMeta = R.compose(mapPickIdProp, R.propOr([], 'connect')) as (x0: any) => { id: ID_Input }[]
export const pickDisconnectUpdateMeta = R.compose(mapPickIdProp, R.propOr([], 'disconnect')) as (x0: any) => { id: ID_Input }[]
export const pickDeleteUpdateMeta = R.compose(mapToId, R.propOr([], 'delete')) as (x0: any) => ID_Input[]