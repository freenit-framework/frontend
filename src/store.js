import React from 'react'

export const Store = React.createContext({})


export const withStore = Component => props => (
  <Store.Consumer>
    {store => <Component {...props} store={store} />}
  </Store.Consumer>
)
