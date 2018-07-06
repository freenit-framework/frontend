import { combineReducers } from 'redux'
import loginReducer from 'pages/login/reducers'


export default combineReducers({ login: loginReducer })
