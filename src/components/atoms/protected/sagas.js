import { call, put } from 'redux-saga/effects'
import service from './service'
import {
  ME_SUCCESS,
  ME_FAILURE,
  REFRESH_SUCCESS,
  REFRESH_FAILURE,
} from './actions'


export function* requestMe(action) {
  try {
    const result = yield call(service.me)
    yield put({ type: ME_SUCCESS, result })
  } catch (error) {
    yield put({ type: ME_FAILURE, error })
  }
}


export function* requestRefresh(action) {
  try {
    const result = yield call(service.refresh)
    yield put({ type: REFRESH_SUCCESS, result })
  } catch (error) {
    yield put({ type: REFRESH_FAILURE, error })
  }
}
