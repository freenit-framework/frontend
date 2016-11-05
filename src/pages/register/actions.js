import { createAction } from 'redux-actions';
import { fetch } from '../../utils';
import REGISTER from './constants';


const reset = createAction(REGISTER, () => ({
  status: 'initial',
}));

const begin = createAction(REGISTER, () => ({
  status: 'pending',
}));

const success = createAction(REGISTER, user => ({
  user,
  status: 'success',
}));

const fail = createAction(REGISTER, error => ({
  error: error.message,
  status: 'error',
}));


const register = (email, profileName, password, loginClass) =>
  (dispatch, getState) => {
    dispatch(begin());
    const apiUrl = getState().backend.apiUrl;
    fetch({
      url: `${apiUrl}/${loginClass}s`,
      body: {
        email,
        profileName,
        password,
      },
      method: 'POST',
    })
      .then(user => {
        dispatch(success(user));
        return user;
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
  register,
};

export default actions;
