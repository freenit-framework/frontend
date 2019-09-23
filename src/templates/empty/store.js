import { BaseStore } from 'store'


export default class NotificationStore extends BaseStore {
  show = async (message) => {
    this.setDetail({
      message,
      show: true,
    })
  }

  close = async () => {
    this.setDetail({ show: false })
  }
}
