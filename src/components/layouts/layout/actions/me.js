import { createAction } from 'redux-actions';
import { fetch } from '../../../../utils';
import { ME } from '../constants';


const reset = createAction(ME, () => ({
  status: 'initial',
}));

const begin = createAction(ME, () => ({
  status: 'pending',
}));

const success = createAction(ME, user => ({
  user,
  status: 'success',
}));

const fail = createAction(ME, error => ({
  error: error.message,
  status: 'error',
}));


const me = () =>
  (dispatch, getState) => {
    dispatch(begin());
    const apiUrl = getState().backend.apiUrl;
    fetch({ url: `${apiUrl}/me` })
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
  me,
};

export default actions;
