export const ME = 'ME'
export const ME_SUCCESS = 'ME_SUCCESS'
export const ME_FAILURE = 'ME_FAILURE'


export function requestMe(creds) {
  return {
    type: ME,
    creds,
  }
}


export default {
  requestMe,
}
