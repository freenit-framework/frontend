import { LOGIN } from './actions'
import initialState from './state'


export default function loginReducer(state = initialState, action) {
  switch (action.type) {
    case LOGIN:
      return {
        ...state,
        isLoading: true,
        isAuthenticated: false,
        error: null,
      }
    default:
      return state
  }
}
