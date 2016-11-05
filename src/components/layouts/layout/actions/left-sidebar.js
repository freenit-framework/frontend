import { createAction } from 'redux-actions';
import { LEFT_SIDEBAR } from '../constants';


const open = createAction(LEFT_SIDEBAR, content => ({
  content,
  open: true,
}));


const close = createAction(LEFT_SIDEBAR, () => ({
  open: false,
}));


const actions = {
  open,
  close,
};

export default actions;
