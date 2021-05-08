import { makeAutoObservable, action } from 'mobx'

class NotificationStore {
  message = null

  constructor() {
    makeAutoObservable(this)
  }

  show = action((message) => {
    this.message = message
  })

  close = action(() => {
    this.message = null
  })
}

export default new NotificationStore()
