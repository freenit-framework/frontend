import {
  LOGIN,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
} from './actions'
import initialState from './state'


export default function loginReducer(state = initialState, action) {
  switch (action.type) {
    case LOGIN:
      return {
        ...state,
        peding: true,
        error: null,
      }
    case LOGIN_SUCCESS:
      const token = action.result.token
      window.localStorage['auth'] = token
      return {
        ...state,
        pending: false,
        error: null,
      }
    case LOGIN_FAILURE:
      const { description, error, status_code } = action.error.response.data
      return {
        ...state,
        description,
        error,
        status_code,
      }
    default:
      return state
  }
}
