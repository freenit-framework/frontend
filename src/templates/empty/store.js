import { makeAutoObservable } from 'mobx'

class NotificationStore {
  message = null

  constructor() {
    makeAutoObservable(this)
  }

  show = (message) => {
    this.message = message
  }
  close = () => {
    this.message = null
  }
}

export default new NotificationStore()
