import { LEFT_SIDEBAR } from '../constants';

export default function leftSidebar(
  state = { open: false },
  action
) {
  switch (action.type) {
    case LEFT_SIDEBAR:
      return action.payload;
    default:
      return state;
  }
}
