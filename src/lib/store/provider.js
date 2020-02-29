import React, { useState } from 'react'
import PropTypes from 'prop-types'

// Pages
import {
  Auth,
  EmptyTemplate,
  Profile,
  Resolution,
  Store,
} from '..'
import { withRouter } from 'react-router-dom'


export const data = {}


const StoreProvider = (props) => {
  const store = {
    auth: new Auth.store(useState(Auth.initial.detail)),
    history: props.history,
    profile: new Profile.store(useState(Profile.initial.detail)),
    notification: new EmptyTemplate.store(
      useState(EmptyTemplate.initial.detail),
    ),
    resolution: new Resolution.store(useState(Resolution.initial.detail)),
  }
  data.store = store
  return (
    <Store.Provider value={store}>
      {props.children}
    </Store.Provider>
  )
}

StoreProvider.propTypes = {
  children: PropTypes.node,
  history: PropTypes.shape({}).isRequired,
}


export default withRouter(StoreProvider)
