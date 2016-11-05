import { combineReducers } from 'redux';
import { backend, notifications } from './containers/app/reducers';
import login from './pages/login/reducers';
import register from './pages/register/reducers';
import settings from './components/layouts/layout/reducers';
import theme from './containers/reducers';


const reducers = {
  backend,
  login,
  notifications,
  register,
  theme,
};


settings.forEach((reducer) => { reducers[reducer.name] = reducer; });


const rootReducer = combineReducers(reducers);


export default rootReducer;
