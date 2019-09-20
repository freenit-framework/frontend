import React from 'react'


const Store = React.createContext({})


export const withStore = (Component) => (props) => {
  return (
    <Store.Consumer>
      {store => <Component {...props} store={store} />}
    </Store.Consumer>
  )
}


export class BaseStore {
  constructor(detail, list = null) {
    this.detail = detail[0]
    this.setDetail = detail[1]
    if (list !== null) {
      this.list = list[0]
      this.setList = list[1]
    }
  }
}


export default Store
