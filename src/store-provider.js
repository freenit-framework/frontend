import React from 'react'
import { withRouter } from 'react-router-dom'

export const StoreContext = React.createContext({ store: {} })

export const withStore = (Component) => (props) => {
  return (
    <StoreContext.Consumer>
      {(store) => <Component store={store} {...props} />}
    </StoreContext.Consumer>
  )
}

const Provider = ({ history, store }) => {
  store.history = history
  return null
}

export const StoreProvider = withRouter(Provider)
