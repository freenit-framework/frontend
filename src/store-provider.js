import React from 'react'
import { withRouter } from 'react-router-dom'
import { store } from './store'

const Provider = (props) => {
  store.history = props.history
  return null
}

export const StoreProvider = withRouter(Provider)
