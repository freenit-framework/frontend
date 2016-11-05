import { createAction } from 'redux-actions';
import { PRODUCT_LIST_HOME } from './constants';
import { fetch } from '../../utils';


const reset = createAction(PRODUCT_LIST_HOME, () => ({
  status: 'initial',
}));


const begin = createAction(PRODUCT_LIST_HOME, () => ({
  status: 'pending',
}));


const success = createAction(PRODUCT_LIST_HOME, products => ({
  products,
  status: 'success',
}));


const fail = createAction(PRODUCT_LIST_HOME, error => ({
  error: error.message,
  status: 'error',
}));


const get = () => (dispatch, getState) => {
  dispatch(begin());
  const apiUrl = getState().backend.apiUrl;
  fetch({ url: `${apiUrl}/products/newest` })
    .then(token => {
      dispatch(success(token));
      return token;
    })
    .catch(error => {
      dispatch(fail(error));
    });
};


const actions = {
  reset,
  begin,
  success,
  fail,
  get,
};

export default actions;
