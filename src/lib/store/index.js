import React from 'react'

const Store = React.createContext({})

export const withStore = Component => props => (
  <Store.Consumer>
    {store => <Component {...props} store={store} />}
  </Store.Consumer>
)

export default Store
