import { createStore, applyMiddleware, compose } from 'redux';
import { persistState } from 'redux-devtools';
import thunk from 'redux-thunk';
import rootReducer from '../reducers';
import DevTools from '../containers/dev-tools';


const enhancer = compose(
  applyMiddleware(thunk),
  DevTools.instrument(),
  persistState(
    // eslint-disable-next-line no-undef
    window.location.href.match(
      /[?&]debug_session=([^&#]+)\b/
    )
  )
);


export default function configureStore(initialState) {
  const store = createStore(rootReducer, initialState, enhancer);
  if (module.hot) {
    module.hot.accept('../reducers', () =>
      // eslint-disable-next-line global-require
      store.replaceReducer(require('../reducers').default)
    );
  }
  return store;
}
