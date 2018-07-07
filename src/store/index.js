import createSagaMiddleware from 'redux-saga'
import { createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import greenApp from './reducers'
import greenSaga from './sagas'
import initialState from './state'


const greenMiddleware = createSagaMiddleware()


export default createStore(
  greenApp,
  initialState,
  composeWithDevTools(
    applyMiddleware(greenMiddleware)
  ),
)


greenMiddleware.run(greenSaga)
