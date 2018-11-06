import {
  AUTH,
  LOGOUT,
  LOGOUT_SUCCESS,
  LOGOUT_FAILURE,
  ME,
  ME_SUCCESS,
  ME_FAILURE,
  REFRESH,
  REFRESH_SUCCESS,
  REFRESH_FAILURE,
  REFRESH_RESET,
} from './actions'


export function authReducer(state = { state: false }, action) {
  switch (action.type) {
    case AUTH:
      return {
        ...state,
        state: action.state,
      }
    default:
      return state
  }
}


export function logoutReducer(state = {}, action) {
  switch (action.type) {
    case LOGOUT:
      return {
        ...state,
        peding: true,
        error: null,
        status: null,
      }
    case LOGOUT_SUCCESS:
      return {
        ...state,
        pending: false,
        error: null,
        status: 200,
      }
    case LOGOUT_FAILURE:
      return {
        ...state,
        pending: false,
        error: action.error.response.data.msg,
        status: action.error.response.status,
      }
    default:
      return state
  }
}


export function meReducer(state = {}, action) {
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
      return {
        ...state,
        pending: false,
        error: action.error.response.data.msg,
        status: action.error.response.status,
      }
    default:
      return state
  }
}


export function refreshReducer(state = {}, action) {
  switch (action.type) {
    case REFRESH:
      return {
        ...state,
        peding: true,
        error: null,
        status: null,
        accessExpire: null,
        refreshExpire: null,
      }
    case REFRESH_SUCCESS:
    {
      const { accessExpire, refreshExpire } = action.result
      return {
        ...state,
        pending: false,
        error: null,
        status: 200,
        accessExpire,
        refreshExpire,
      }
    }
    case REFRESH_FAILURE:
      return {
        ...state,
        pending: false,
        error: action.error.response.data.msg,
        status: action.error.response.status,
        accessExpire: null,
        refreshExpire: null,
      }
    case REFRESH_RESET:
      return {
        ...state,
        pending: false,
        error: null,
        status: null,
        accessExpire: null,
        refreshExpire: null,
      }
    default:
      return state
  }
}
