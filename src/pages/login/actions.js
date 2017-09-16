import { createAction } from 'redux-actions';
import { fetch, tokenName } from '../../utils';
import LOGIN from './constants';


const reset = createAction(LOGIN, () => ({
  status: 'initial',
}));

const begin = createAction(LOGIN, () => ({
  status: 'pending',
}));

const success = createAction(LOGIN, json => {
  // eslint-disable-next-line no-undef
  window.localStorage[tokenName] = json.token;
  return {
    token: json.token,
    status: 'success',
  };
});

const fail = createAction(LOGIN, error => ({
  error: error.message,
  status: 'error',
}));


const login = (email, password) =>
  (dispatch, getState) => {
    dispatch(begin());
    const apiUrl = getState().backend.apiUrl;
    fetch({
      url: `${apiUrl}/auth/tokens`,
      body: {
        email,
        password,
      },
      contentType: 'application/json',
      method: 'POST',
    })
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
  login,
};

export default actions;
