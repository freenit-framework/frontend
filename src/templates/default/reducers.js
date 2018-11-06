import {
  TITLE,
  TITLE_RESET,
} from './actions'


export default function titleReducer(state = { title: '' }, action) {
  switch (action.type) {
    case TITLE:
      return {
        ...state,
        title: action.title,
      }
    case TITLE_RESET:
      return {
        title: '',
      }
    default:
      return state
  }
}
