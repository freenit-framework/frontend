import { rest } from './utils'


class Auth
{
  access = { expire: null, date: null }
  refresh = { expire: null, data: null }

  init = async (api) => {
    window.rest = rest(api)
    window.rest.API_ROOT = api
    await this.refresh()
  }

  login = async (email, password) => {
    try {
      const response = await window.rest.post('/auth/login', {email, password})
      const { accessExpire, refreshExpire } = response.data
      const now = new Date()
      this.access.expire = Number(accessExpire)
      this.access.date = new Date(now.getTime() + this.access.expire * 1000)
      this.refresh.expire = Number(refreshExpire)
      this.refresh.date = new Date(now.getTime() + this.refresh.expire * 1000)
      const result = {
        access: this.access,
        refresh: this.refresh,
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
      this.access.expire = null
      this.access.date = null
      this.refresh.expire = null
      this.refresh.date = null
      return { ok: true }
    } catch (error) {
      return { ...error, ok: false }
    }
  }

  refresh = async () => {
    try {
      const response = await window.rest.post('/auth/refresh', {})
      const { accessExpire, refreshExpire } = response.data
      const now = new Date()
      this.access.expire = Number(accessExpire)
      this.access.date = new Date(now.getTime() + this.access.expire * 1000)
      this.refresh.expire = Number(refreshExpire)
      this.refresh.date = new Date(now.getTime() + this.refresh.expire * 1000)
      return {
        access: this.access,
        refresh: this.access,
        ok: true,
      }
    } catch (error) {
      return { ...error, ok: false }
    }
  }

  authenticated = () => {
    if (!this.access.expire) { return false }
    if (!this.refresh.expire) { return false }
    const now = new Date()
    if (now > this.access.date) { return false }
    if (now > this.refresh.date) { return false }
    return true
  }

  protect = (fn) => async (...data) => {
    if (!this.authenticated()) {
      const response = await this.refresh()
      if (!response.ok) { return response }
    }
    return await fn(...data)
  }
}


export const auth = new Auth()
