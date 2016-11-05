import { ME } from '../constants';

export default function me(
  state = { open: false },
  action
) {
  switch (action.type) {
    case ME:
      return action.payload;
    default:
      return state;
  }
}
