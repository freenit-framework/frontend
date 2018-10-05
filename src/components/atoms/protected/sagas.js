import { call, put } from 'redux-saga/effects'
import ProtectedService from './service'
import {
  LOGOUT_SUCCESS,
  LOGOUT_FAILURE,
  ME_SUCCESS,
  ME_FAILURE,
  REFRESH_SUCCESS,
  REFRESH_FAILURE,
} from './actions'


export function* logoutSaga() {
  try {
    const result = yield call(ProtectedService.logout)
    yield put({ type: LOGOUT_SUCCESS, result })
  } catch (error) {
    yield put({ type: LOGOUT_FAILURE, error })
  }
}


export function* meSaga() {
  try {
    const result = yield call(ProtectedService.me)
    yield put({ type: ME_SUCCESS, result })
  } catch (error) {
    yield put({ type: ME_FAILURE, error })
  }
}


export function* refreshSaga() {
  try {
    const result = yield call(ProtectedService.refresh)
    yield put({ type: REFRESH_SUCCESS, result })
  } catch (error) {
    yield put({ type: REFRESH_FAILURE, error })
  }
}
