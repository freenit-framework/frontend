import service from './service'
import { BaseStore } from 'store'
import initial from './initial'


export default class AuthStore extends BaseStore {
  timeoutHandler = null

  login = async (email, password) => {
    try {
      const response = await service.login(email, password)
      const { accessExpire, refreshExpire } = response
      const result = {
        accessExpire,
        refreshExpire,
        ok: true,
      }
      this.setDetail(result)
      return result
    } catch (error) {
      const result = {
        ...initial,
        ok: false,
      }
      this.setDetail(result)
      return {
        ...error,
        ...result,
      }
    }
  }

  logout = async () => {
    try {
      await service.logout()
      const result = {}
      this.setDetail(result)
      return result
    } catch (error) {
      const result = {
        ok: false,
      }
      this.setDetail(result)
      return {
        ...error,
        ...result,
      }
    }
  }

  refresh = async () => {
    if (this.detail.refreshing) {
      return {
        ...this.detail,
        ok: true,
      }
    }
    try {
      const response = await service.refresh()
      const { accessExpire, refreshExpire } = response
      const result = {
        ...this.detail,
        accessExpire,
        refreshExpire,
        refreshing: true,
        ok: true,
      }
      this.setDetail(result)
      clearTimeout(this.timeoutHandler)
      this.timeoutHandler = setTimeout(
        () => {
          this.setDetail({
            ...this.detail,
            refreshing: false,
          })
          this.refresh()
        },
        result.accessExpire * 1000,
      )
      return result
    } catch (error) {
      clearTimeout(this.timeoutHandler)
      this.timeoutHandler = null
      const result = {
        ...initial,
        ok: false,
      }
      this.setDetail(result)
      return {
        ...error,
        ...result,
      }
    }
  }

  register = async (email, password) => {
    try {
      const response = await service.register(email, password)
      const { accessExpire, refreshExpire } = response
      const result = {
        accessExpire,
        refreshExpire,
        ok: true,
      }
      this.setDetail(result)
      return result
    } catch (error) {
      const result = {
        ...initial,
        ok: false,
      }
      this.setDetail(result)
      return {
        ...error,
        ...result,
      }
    }
  }
}
