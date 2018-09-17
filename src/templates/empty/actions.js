export const ERROR = 'ERROR'
export const ERROR_RESET = 'ERROR_RESET'


export function requestError(message) {
  return {
    message,
    type: ERROR,
  }
}


export function requestErrorReset() {
  return { type: ERROR_RESET }
}


export default {
  requestError,
  requestErrorReset,
}
