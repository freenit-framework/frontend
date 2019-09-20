import React, { useState } from 'react'
import Store from 'store'
import { BrowserRouter as Router, Route } from 'react-router-dom'

// Pages
import Auth from 'pages/auth'
import Dashboard from 'pages/dashboard'
import Landing from 'pages/landing'
import NoPage from 'pages/nopage'
import User from 'pages/user'


function App() {
  const store = {
    auth: new Auth.store(useState(Auth.initial.detail)),
    user: new User.store(
      useState(User.initial.detail),
      useState(User.initial.list),
    ),
  }
  return (
    <Store.Provider value={store}>
      <Router>
        <Route exact path="/" component={Landing} />
        <Route exact path="/dashboard" component={Dashboard} />
        <Route exact path="/login" component={Auth.detail} />
        <Route exact path="/users" component={User.list} />
        <Route exact path="/users/:page" component={User.list} />
        <Route exact path="/user/:id" component={User.detail} />
        <Route path="*" component={NoPage} />
      </Router>
    </Store.Provider>
  )
}


export default App
