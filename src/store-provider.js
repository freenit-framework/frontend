import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'
import {
  Auth,
  Landing,
  Profile,
  Resolution,
  Role,
  User,
} from 'pages'
import {
  EmptyTemplate,
} from 'templates'
import { Store } from 'store'


const Provider = (props) => {
  const store = {
    auth: new Auth.store(useState(Auth.initial.detail)),
    history: props.history,
    landing: new Landing.store(useState(Landing.initial.detail)),
    notification: new EmptyTemplate.store(
      useState(EmptyTemplate.initial.detail),
    ),
    profile: new Profile.store(
      useState(Profile.initial.detail),
    ),
    resolution: new Resolution.store(useState(Resolution.initial.detail)),
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


export const StoreProvider = withRouter(Provider)
