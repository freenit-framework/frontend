import React from 'react'
import { Switch, Route } from 'react-router-dom'

// Pages
import Auth from 'pages/auth'
import Dashboard from 'pages/dashboard'
import Landing from 'pages/landing'
import Me from 'pages/me'
import NoPage from 'pages/nopage'
import Role from 'pages/role'
import User from 'pages/user'


function Routing() {
  return (
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
  )
}


export default Routing
