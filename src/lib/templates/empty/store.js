export default class NotificationStore {
  constructor(detail) {
    this.detail = detail[0] // eslint-disable-line prefer-destructuring
    this.setDetail = detail[1] // eslint-disable-line prefer-destructuring
  }

  show = async message => {
    this.setDetail({
      message,
      show: true,
    })
  }

  close = async () => {
    this.setDetail({ show: false })
  }
}
