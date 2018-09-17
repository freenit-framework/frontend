import { combineReducers } from 'redux'
import errorReducer from 'templates/empty/reducers'
import loginReducer from 'pages/login/reducers'
import { meReducer, refreshReducer } from 'components/atoms/protected/reducers'


export default combineReducers({
  login: loginReducer,
  me: meReducer,
  refresh: refreshReducer,
  error: errorReducer,
})
