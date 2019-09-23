import service from './service'
import { BaseStore } from 'store'


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
      if (this.timeoutHandler) {
        clearTimeout(this.timeoutHandler)
      }
      this.timeoutHandler = setTimeout(
        () => {this.refresh()},
        result.accessExpire * 1000,
      )
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
    try {
      const response = await service.refresh()
      const { accessExpire, refreshExpire } = response
      const result = {
        accessExpire,
        refreshExpire,
        ok: true,
      }
      if (this.timeoutHandler) {
        clearTimeout(this.timeoutHandler)
      }
      this.timeoutHandler = setTimeout(
        () => {this.refresh()},
        result.accessExpire * 1000,
      )
      this.setDetail(result)
      return result
    } catch (error) {
      this.timeoutHandler = null
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
}
