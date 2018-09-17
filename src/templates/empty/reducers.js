import {
  ERROR,
  ERROR_RESET,
} from './actions'


export default function errorReducer(
  state = { message: '', open: false },
  action,
) {
  switch (action.type) {
    case ERROR:
      return {
        ...state,
        message: action.message,
        open: true,
      }
    case ERROR_RESET:
      return {
        message: '',
        open: false,
      }
    default:
      return state
  }
}
