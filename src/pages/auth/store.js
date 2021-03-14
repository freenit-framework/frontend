import { makeAutoObservable } from 'mobx'


export default class AuthStore {
  timeoutHandler = null
  accessExpire = null
  refreshExpire = null
  refreshing = false

  constructor() {
    makeAutoObservable(this)
  }

  login = async (email, password) => {
    try {
      const response = await window.rest.post('/auth/login', {email, password})
      const { accessExpire, refreshExpire } = response.data
      this.accessExpire = accessExpire
      this.refreshExpire = refreshExpire
      const result = {
        accessExpire,
        refreshExpire,
        ok: true,
      }
      return result
    } catch (error) {
      return { ...error, ok: false }
    }
  }

  logout = async () => {
    try {
      await window.rest.post('/auth/logout', {})
      this.accessExpire = null
      this.refreshExpire = null
      return { ok: true }
    } catch (error) {
      return { ...error, ok: false }
    }
  }

  refresh = async () => {
    if (this.refreshing) {
      return {
        accessExpire: this.accessExpire,
        refreshExpire: this.refreshExpire,
        ok: true,
      }
    }
    try {
      const response = await window.rest.post('/auth/refresh', {})
      const { accessExpire, refreshExpire } = response.data
      this.accessExpire = accessExpire
      this.refreshExpire = refreshExpire
      this.refreshing = false
      const result = {
        accessExpire,
        refreshExpire,
        ok: true,
      }
      clearTimeout(this.timeoutHandler)
      this.timeoutHandler = setTimeout(
        () => {
          this.refreshing = false
          this.refresh()
        },
        result.accessExpire * 1000,
      )

      return result
    } catch (error) {
      clearTimeout(this.timeoutHandler)
      this.timeoutHandler = null
      return {
        ...error,
        ok: false,
      }
    }
  }

  confirm = async (token) => {
    try {
      await window.rest.get(`/auth/register/${token}`)
      const result = {
        ok: true,
      }
      return result
    } catch (error) {
      return {
        ...error,
        ok: false,
      }
    }
  }

  register = async (email, password) => {
    try {
      await window.rest.post('/auth/register', { email, password })
      const result = { ok: true }
      return result
    } catch (error) {
      return { ...error, ok: false }
    }
  }

  reset = async email => {
    try {
      await window.rest.post('/auth/reset/request', { email })
      return { ok: true }
    } catch (error) {
      return { ...error, ok: false }
    }
  }

  changePassword = async (password, token) => {
    try {
      await window.rest.post('/auth/reset', { password, token })
      return { ok: true }
    } catch (error) {
      return { ...error, ok: false }
    }
  }
}
