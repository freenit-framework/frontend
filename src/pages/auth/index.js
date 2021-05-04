import ChangePassword from './change-password'
import Confirm from './confirm'
import Login from './login'
import Register from './register'
import Reset from './reset'
import { auth as store } from '../../auth'

const auth = {
  ChangePassword,
  Confirm,
  Login,
  Register,
  Reset,
  store,
}

export default auth
