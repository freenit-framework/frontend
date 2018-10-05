import { takeLatest } from 'redux-saga/effects'

// Actions
import { LOGIN } from 'pages/login/actions'
import { ME, REFRESH } from 'components/atoms/protected/actions'

// Sagas
import loginSaga from 'pages/login/sagas'
import { meSaga, refreshSaga } from 'components/atoms/protected/sagas'


export default function* greenSaga() {
  yield takeLatest(LOGIN, loginSaga)
  yield takeLatest(ME, meSaga)
  yield takeLatest(REFRESH, refreshSaga)
}
