import React from 'react'
import { withRouter } from 'react-router-dom'
import {
  Auth,
  Landing,
  Profile,
  Resolution,
  Role,
  User,
} from './pages'
import { Store } from './store'
import { EmptyTemplate } from './templates'


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
  props.store.history = props.history
  return (
    <Store.Provider value={props.store}>
      {props.children}
    </Store.Provider>
  )
}


export const StoreProvider = withRouter(Provider)
