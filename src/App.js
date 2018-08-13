import React, { Component } from 'react'
import { Provider } from 'react-redux'
import { Switch, Route, BrowserRouter } from 'react-router-dom'
import Home from 'pages/home'
import Landing from 'pages/landing'
import Login from 'pages/login'
import NoPage from 'pages/nopage'
import store from 'store'


class App extends Component {
  render() {
    return (
    <Provider store={store}>
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/landing" component={Landing} />
          <Route exact path="/login" component={Login} />
          <Route path="*" component={NoPage} />
        </Switch>
      </BrowserRouter>
    </Provider>
    )
  }
}


export default App
