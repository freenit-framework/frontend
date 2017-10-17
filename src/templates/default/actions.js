import { createAction } from 'redux-actions';
import SETTINGS_DRAWER from './constants';


const open = createAction(SETTINGS_DRAWER, () => ({
  open: true,
}));


const close = createAction(SETTINGS_DRAWER, () => ({
  open: false,
}));


const toggleSettings = () =>
  (dispatch, getState) => {
    if (getState().settings.open) {
      dispatch(close());
    } else {
      dispatch(open());
    }
  };


const actions = {
  close,
  open,
  toggleSettings,
};

export default actions;
