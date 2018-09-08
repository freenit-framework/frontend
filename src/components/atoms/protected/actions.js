export const ME = 'ME'
export const ME_SUCCESS = 'ME_SUCCESS'
export const ME_FAILURE = 'ME_FAILURE'
export const REFRESH = 'REFRESH'
export const REFRESH_SUCCESS = 'REFRESH_SUCCESS'
export const REFRESH_FAILURE = 'REFRESH_FAILURE'
export const REFRESH_RESET= 'REFRESH_RESET'


export function requestMe() {
  return { type: ME }
}


export function requestRefresh() {
  return { type: REFRESH }
}


export function requestRefreshReset() {
  return { type: REFRESH_RESET }
}


export default {
  requestMe,
  requestRefresh,
  requestRefreshReset,
}
