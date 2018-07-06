import createSagaMiddleware from 'redux-saga'
import { createStore, applyMiddleware, compose } from 'redux'
import greenApp from './reducers'
import greenSaga from './sagas'
import initialState from './state'


const greenMiddleware = createSagaMiddleware()


export default createStore(
  greenApp,
  initialState,
  compose(applyMiddleware(greenMiddleware)),
)


greenMiddleware.run(greenSaga)
