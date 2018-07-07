export const LOGIN = 'LOGIN'
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS'
export const LOGIN_FAILURE = 'LOGIN_FAILURE'


export function requestLogin(creds) {
  return {
    type: LOGIN,
    creds,
  }
}


export default {
  requestLogin,
}
