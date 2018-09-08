import { takeLatest } from 'redux-saga/effects'

// Actions
import { LOGIN } from 'pages/login/actions'
import { ME, REFRESH } from 'components/atoms/protected/actions'

// Sagas
import { requestLogin } from 'pages/login/sagas'
import { requestMe, requestRefresh } from 'components/atoms/protected/sagas'


export default function* greenSaga() {
  yield takeLatest(LOGIN, requestLogin)
  yield takeLatest(ME, requestMe)
  yield takeLatest(REFRESH, requestRefresh)
}
