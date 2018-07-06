import { combineReducers } from 'redux'
import { ONLINE } from './actions'


const initial = {
  app: {},
}


function app(state = initial.app, { type, payload }) {
  switch (type) {
    case ONLINE:
      return { ...state, status: true };
    default:
      return state
  }
}


export default combineReducers({
  app,
})
