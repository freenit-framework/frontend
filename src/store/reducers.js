import { combineReducers } from 'redux'
import loginReducer from 'pages/login/reducers'
import meReducer from 'components/atoms/protected/reducers'


export default combineReducers({
  login: loginReducer,
  me: meReducer,
})
