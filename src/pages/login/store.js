import { observable } from 'mobx'
import service from './service'


export default class AuthStore {
  @observable accessToken = ''

  @observable accessExpire = 0

  @observable refreshToken = ''

  @observable refreshExpire = 0

  @observable auth = false

  @observable error = null

  @observable status = 0

  @observable email = ''

  @observable password = ''

  async login() {
    try {
      const result = await service.login({
        email: this.email,
        password: this.password,
      })
      this.auth = true
      this.error = null
      this.status = 200
      this.accessToken = result.access
      this.accessExpire = result.accessExpire
      this.refreshToken = result.refresh
      this.refreshExpire = result.refreshExpire
    } catch (error) {
      this.auth = false
      this.error = error.response.data.message
      this.status = error.response.status
      this.access = null
      this.accessExpire = null
      this.refresh = null
      this.refreshExpire = null
    }
  }

  async refresh() {
    try {
      const result = await service.refresh()
      this.auth = true
      this.error = null
      this.status = 200
      this.accessToken = result.access
      this.accessExpire = result.accessExpire
      this.refreshExpire = result.refreshExpire
    } catch (error) {
      if (error.response) {
        this.status = error.response.status
        if (error.response.data) {
          this.error = error.response.data.message
        }
      } else {
        this.status = 401
      }
    }
  }
}
