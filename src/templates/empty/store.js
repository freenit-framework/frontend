import { makeAutoObservable } from 'mobx'


export default class NotificationStore {
  message = null

  constructor() {
    makeAutoObservable(this)
  }

  show = (message) => { this.message = message }
  close = () => { this.message = null }
}
