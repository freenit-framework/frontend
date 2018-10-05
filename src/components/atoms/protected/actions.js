export const AUTH = 'AUTH'

export const LOGOUT = 'LOGOUT'
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS'
export const LOGOUT_FAILURE = 'LOGOUT_FAILURE'

export const ME = 'ME'
export const ME_SUCCESS = 'ME_SUCCESS'
export const ME_FAILURE = 'ME_FAILURE'

export const REFRESH = 'REFRESH'
export const REFRESH_SUCCESS = 'REFRESH_SUCCESS'
export const REFRESH_FAILURE = 'REFRESH_FAILURE'
export const REFRESH_RESET = 'REFRESH_RESET'


export function requestMe() {
  return { type: ME }
}


export function requestRefresh() {
  return { type: REFRESH }
}


export function requestRefreshReset() {
  return { type: REFRESH_RESET }
}


export function auth(state) {
  return {
    state,
    type: AUTH,
  }
}


export function requestLogout() {
  return { type: LOGOUT }
}


export default {
  auth,
  requestLogout,
  requestMe,
  requestRefresh,
  requestRefreshReset,
}
