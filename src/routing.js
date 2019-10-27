import React from 'react'
import { Switch, Route } from 'react-router-dom'

// Pages
import Auth from 'pages/auth'
import Dashboard from 'pages/dashboard/detail'
import Landing from 'pages/landing/detail'
import Me from 'pages/me'
import NoPage from 'pages/nopage/detail'
import Role from 'pages/role'
import User from 'pages/user'


const Routing = () => {
  return (
    <Switch>
      <Route exact path="/" component={Landing} />
      <Route exact path="/dashboard" component={Dashboard} />
      <Route exact path="/login" component={Auth.login} />
      <Route exact path="/me" component={Me.detail} />
      <Route exact path="/register" component={Auth.register} />
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
