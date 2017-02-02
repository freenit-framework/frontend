import { combineReducers } from 'redux';
import login from './pages/login/reducers';
import settings from './components/layouts/layout/reducers';
import theme from './containers/reducers';
import { backend, notifications } from './containers/app/reducers';


const reducers = {
  backend,
  login,
  notifications,
  theme,
};

settings.forEach(reducer => { reducers[reducer.name] = reducer; });


const rootReducer = combineReducers(reducers);

export default rootReducer;
