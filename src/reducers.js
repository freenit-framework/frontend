import { combineReducers } from 'redux';

// Containers
import theme from './containers/reducers';

// Templates
import settings from './templates/default/reducers';

// Pages
import login from './pages/login/reducers';


const reducers = {
  login,
  settings,
  theme,
};


export default combineReducers(reducers);
