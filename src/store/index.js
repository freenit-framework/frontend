import createSagaMiddleware from 'redux-saga'
import { createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import greenApp from './reducers'
import greenSaga from './sagas'


const initialState = {}
const greenMiddleware = createSagaMiddleware()


export default createStore(
  greenApp,
  initialState,
  composeWithDevTools(
    applyMiddleware(greenMiddleware)
  ),
)


greenMiddleware.run(greenSaga)
