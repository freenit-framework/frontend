import { call, put } from 'redux-saga/effects'
import MeService from './service'
import { ME_SUCCESS, ME_FAILURE } from './actions'


export function* requestMe(action) {
  try {
    const result = yield call(MeService.me, action.creds)
    yield put({ type: ME_SUCCESS, result })
  } catch (error) {
    yield put({ type: ME_FAILURE, error })
  }
}
