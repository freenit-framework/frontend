import { combineReducers } from 'redux'

// atoms
import {
  authReducer,
  logoutReducer,
  meReducer,
  refreshReducer,
} from 'components/atoms/protected/reducers'

// pages
import loginReducer from 'pages/login/reducers'

// templates
import errorReducer from 'templates/empty/reducers'
import titleReducer from 'templates/default/reducers'

export default combineReducers({
  auth: authReducer,
  error: errorReducer,
  login: loginReducer,
  logout: logoutReducer,
  me: meReducer,
  refresh: refreshReducer,
  title: titleReducer,
})
