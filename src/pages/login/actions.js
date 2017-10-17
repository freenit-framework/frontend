import { createAction } from 'redux-actions';
import { fetch, tokenName } from '../../utils';
import { apiUrl } from '../../constants';
import LOGIN from './constants';


const reset = createAction(LOGIN, () => ({
  status: 'initial',
}));

const begin = createAction(LOGIN, () => ({
  status: 'pending',
}));

const success = createAction(LOGIN, json => {
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
  (dispatch) => {
    dispatch(begin());
    fetch({
      url: `${apiUrl}/auth/tokens`,
      body: {
        email,
        password,
      },
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
