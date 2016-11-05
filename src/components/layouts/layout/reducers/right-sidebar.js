import { RIGHT_SIDEBAR } from '../constants';

export default function rightSidebar(
  state = { open: false },
  action
) {
  switch (action.type) {
    case RIGHT_SIDEBAR:
      return action.payload;
    default:
      return state;
  }
}
