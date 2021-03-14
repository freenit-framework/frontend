import React from 'react'
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


export const store = {
  auth: Auth.store,
  landing: Landing.store,
  notification: EmptyTemplate.store,
  profile: Profile.store,
  resolution: Resolution.store,
  role: Role.store,
  user: User.store,
}


const Provider = (props) => {
  store.history = props.history
  return (
    <Store.Provider value={store}>
      {props.children}
    </Store.Provider>
  )
}


export const StoreProvider = withRouter(Provider)
