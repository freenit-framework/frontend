import store from 'store'


export const API_ROOT = '/api/v0'
let timeout;


export function getCookie(name) {
  var value = "; " + document.cookie
  var parts = value.split("; " + name + "=")
  if (parts.length === 2) return parts.pop().split(";").shift()
}


export const refreshTimeout = () => {
  const accessTimeout = store.auth.accessExpire === 0
    ? 0
    : (store.auth.accessExpire - 5) * 1000
  timeout = setTimeout(refreshExecute, accessTimeout)
}


export const refreshExecute = async (timeout) => {
  await store.auth.refresh()
  if (store.auth.status === 200) {
    if (2 * store.auth.accessExpire > store.auth.refreshExpire) {
      store.error.message = 'Refresh token is soon to expire! Please go to login page.'
      store.error.open = true
    }
    refreshTimeout()
  }
}


export const timeoutClear = () => {
  clearTimeout(timeout)
  timeout = null
}
