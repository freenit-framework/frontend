import { decorate, observable } from 'mobx'
import service from './service'


export default decorate(
  class AuthStore {
    accessToken = ''

    accessExpire = 0

    refreshToken = ''

    refreshExpire = 0

    auth = false

    error = null

    status = 0

    email = ''

    password = ''

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
      } catch (error) {
        this.auth = false
        this.error = error.response.data.message
        this.status = error.response.status
        this.accessToken = null
        this.accessExpire = null
      }
    }
  },

  {
    accessExpire: observable,
    accessToken: observable,
    auth: observable,
    email: observable,
    error: observable,
    password: observable,
    refreshExpire: observable,
    refreshToken: observable,
    status: observable,
  },
)
