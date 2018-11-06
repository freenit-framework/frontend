export const TITLE = 'TITLE'
export const TITLE_RESET = 'TITLE_RESET'


export function requestTitle(title) {
  return {
    title,
    type: TITLE,
  }
}


export function requestTitleReset() {
  return { type: TITLE_RESET }
}


export default {
  requestTitle,
  requestTitleReset,
}
