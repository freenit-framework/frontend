import { createAction } from 'redux-actions';
import { SETTINGS } from '../constants';


const open = createAction(SETTINGS, settings => ({
  settings,
  open: true,
}));


const close = createAction(SETTINGS, () => ({
  open: false,
}));


const actions = {
  open,
  close,
};

export default actions;
