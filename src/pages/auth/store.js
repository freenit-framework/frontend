import service from './service'
import { BaseStore } from 'store'


export default class AuthStore extends BaseStore {
  timeoutHandler = null

  async login(email, password) {
    try {
      const response = await service.login(email, password)
      const { access, accessExpire, refresh, refreshExpire } = response
      const result = {
        access,
        accessExpire,
        refresh,
        refreshExpire,
        auth: true,
        ok: true,
      }
      if (this.timeoutHandler) {
        clearTimeout(this.timeoutHandler)
      }
      this.timeoutHandler = setTimeout(
        this.refresh,
        result.accessExpire * 1000,
      )
      this.setDetail(result)
      return result
    } catch (error) {
      const result = {
        ...error,
        auth: false,
        ok: false,
      }
      this.setDetail(result)
      return result
    }
  }

  async refresh() {
    try {
      const response = await service.refresh()
      const { access, accessExpire, refreshExpire } = response
      const { refresh } = this.detail
      const result = {
        access,
        accessExpire,
        refresh,
        refreshExpire,
        auth: true,
        ok: true,
      }
      if (this.timeoutHandler) {
        clearTimeout(this.timeoutHandler)
      }
      this.timeoutHandler = setTimeout(
        this.refresh,
        result.accessExpire * 1000,
      )
      this.setDetail(result)
      return result
    } catch (error) {
      this.timeoutHandler = null
      const result = {
        ...error,
        auth: false,
        ok: false,
      }
      this.setDetail(result)
      return result
    }
  }
}
