import { takeLatest } from 'redux-saga/effects'
import { LOGIN } from 'pages/login/actions'
import { requestLogin } from 'pages/login/sagas'


export default function* greenSaga() {
  yield takeLatest(LOGIN, requestLogin)
}
