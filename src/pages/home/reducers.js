import { PRODUCT_LIST_HOME } from './constants.js';


export default function productListHome(
  state = {},
  action
) {
  switch (action.type) {
    case PRODUCT_LIST_HOME:
      return action.payload;
    default:
      return state;
  }
}
