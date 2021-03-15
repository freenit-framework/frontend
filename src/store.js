import React from 'react'
import { observer } from 'mobx-react'


export const Store = React.createContext({})


export const withStore = Component => props => {
  const ObservedComponent = observer(Component)
  return (
    <Store.Consumer>
      {store => <ObservedComponent {...props} store={store} />}
    </Store.Consumer>
  )
}
