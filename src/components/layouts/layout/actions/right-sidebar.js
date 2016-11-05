import { createAction } from 'redux-actions';
import { RIGHT_SIDEBAR } from '../constants';


const open = createAction(RIGHT_SIDEBAR, content => ({
  content,
  open: true,
}));


const close = createAction(RIGHT_SIDEBAR, () => ({
  open: false,
}));


const actions = {
  open,
  close,
};

export default actions;
