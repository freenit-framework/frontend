import LOGIN from './constants';

export default function login(state = { status: 'initial' }, action) {
  switch (action.type) {
    case LOGIN: {
      return {
        token: action.payload.token,
        error: action.payload.error,
        status: action.payload.status,
      };
    }
    default:
      return state;
  }
}
