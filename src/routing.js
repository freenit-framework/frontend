import React from 'react'
import { Switch, Route } from 'react-router-dom'

// Pages
import {
  Auth,
  Dashboard,
  Profile,
  NoPage,
  Role,
  User,
  rest,
} from './lib'


const API_ROOT = '/api/v0'
window.rest = rest(API_ROOT)
window.rest.API_ROOT = API_ROOT


const Routing = () => {
  return (
    <Switch>
      <Route exact path="/dashboard" component={Dashboard.detail} />
      <Route exact path="/login" component={Auth.login} />
      <Route exact path="/profile" component={Profile.detail} />
      <Route exact path="/register" component={Auth.register} />
      <Route exact path="/reset" component={Auth.reset} />
      <Route exact path="/reset/:token" component={Auth.changePassword} />
      <Route exact path="/role/:id" component={Role.detail} />
      <Route exact path="/roles" component={Role.list} />
      <Route exact path="/roles/:page" component={Role.list} />
      <Route exact path="/user/:id" component={User.detail} />
      <Route exact path="/users" component={User.list} />
      <Route exact path="/users/:page" component={User.list} />
      <Route path="*" component={NoPage.detail} />
    </Switch>
  )
}


export default Routing
