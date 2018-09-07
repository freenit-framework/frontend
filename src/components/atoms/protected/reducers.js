import {
  ME,
  ME_SUCCESS,
  ME_FAILURE,
} from './actions'
import initialState from './state'


export default function meReducer(state = initialState, action) {
  switch (action.type) {
    case ME:
      return {
        ...state,
        peding: true,
        error: null,
        status: null,
      }
    case ME_SUCCESS:
      return {
        ...state,
        pending: false,
        error: null,
        status: 200,
      }
    case ME_FAILURE:
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
