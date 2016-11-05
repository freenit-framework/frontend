import LOGIN from './constants';

export default function login(state = { status: 'initial' }, action) {
  switch (action.type) {
    case LOGIN: {
      return action.payload;
    }
    default:
      return state;
  }
}
