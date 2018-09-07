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
        status: null,
      }
    case LOGIN_SUCCESS:
      return {
        ...state,
        pending: false,
        error: null,
        status: 200,
      }
    case LOGIN_FAILURE:
      const error = action.error.response.data.message
      const status = action.error.response.status
      return {
        ...state,
        error,
        status,
      }
    default:
      return state
  }
}
