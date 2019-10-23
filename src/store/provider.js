import React, { useState } from 'react'
import Store from './index'

// Pages
import Auth from 'pages/auth'
import Me from 'pages/me'
import Role from 'pages/role'
import User from 'pages/user'

// Templates
import Notification from 'templates/empty'


export default (props) => {
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
      {props.children}
    </Store.Provider>
  )
}
