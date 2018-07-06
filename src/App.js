import React, { Component } from 'react'
import { Provider } from 'react-redux'
import { Switch, Route, BrowserRouter } from 'react-router-dom'
import Landing from 'pages/landing'
import store from './store'


class App extends Component {
  render() {
    return (
    <Provider store={store}>
      <BrowserRouter>
        <Switch>
          <Route exact path="/landing" component={Landing} />
        </Switch>
      </BrowserRouter>
    </Provider>
    )
  }
}


export default App
