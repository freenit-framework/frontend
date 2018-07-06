import { createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import createSagaMiddleware from 'redux-saga'
import rootReducer from './reducers'


const sagaMiddleware = createSagaMiddleware()


const enhancer = composeWithDevTools(
  applyMiddleware(sagaMiddleware),
)


export default function configureStore(initialState) {
  const store = createStore(rootReducer, initialState, enhancer);

  if (module.hot) {
    module.hot.accept('./reducers', () =>
      store.replaceReducer(require('./reducers').default)
    )
  }

  return store
}
