import React, { useState } from 'react'
import Store from 'store'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import './App.css'

// Pages
import Auth from 'pages/auth'
import Dashboard from 'pages/dashboard'
import Landing from 'pages/landing'
import Me from 'pages/me'
import NoPage from 'pages/nopage'
import Role from 'pages/role'
import User from 'pages/user'

// Templates
import Notification from 'templates/empty'


function App() {
  const store = {
    auth: new Auth.store(
      useState(Auth.initial.detail),
      useState(Auth.initial.register),
    ),
    me: new Me.store(
      useState(Me.initial.detail),
    ),
    notification: new Notification.store(
      useState(Notification.initial.detail),
    ),
    role: new Role.store(
      useState(Role.initial.detail),
      useState(Role.initial.list),
    ),
    user: new User.store(
      useState(User.initial.detail),
      useState(User.initial.list),
    ),
  }
  return (
    <Store.Provider value={store}>
      <Router>
        <Switch>
          <Route exact path="/" component={Landing} />
          <Route exact path="/dashboard" component={Dashboard} />
          <Route exact path="/login" component={Auth.detail} />
          <Route exact path="/me" component={Me.detail} />
          <Route exact path="/roles" component={Role.list} />
          <Route exact path="/roles/:page" component={Role.list} />
          <Route exact path="/role/:id" component={Role.detail} />
          <Route exact path="/users" component={User.list} />
          <Route exact path="/users/:page" component={User.list} />
          <Route exact path="/user/:id" component={User.detail} />
          <Route path="*" component={NoPage} />
        </Switch>
      </Router>
    </Store.Provider>
  )
}


export default App
