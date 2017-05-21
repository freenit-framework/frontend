import { SETTINGS } from '../constants';

export default function settings(
  state = { open: false },
  action
) {
  switch (action.type) {
    case SETTINGS:
      return action.payload;
    default:
      return state;
  }
}
