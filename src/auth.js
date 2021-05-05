import { observable, action } from 'mobx'
import { rest } from './utils'

class AuthStore {
  tokens = observable({
    access: { expire: null, date: null },
    refresh: { expire: null, data: null },
  })
  initialized = observable(false)

  init = action(async (api) => {
    window.rest = rest(api)
    window.rest.API_ROOT = api
    this.initialized = true
    return await this.refresh(true)
  })

  login = action(async (email, password) => {
    try {
      const response = await window.rest.post('/auth/login', {
        email,
        password,
      })
      const { accessExpire, refreshExpire } = response.data
      const now = new Date()
      const ae = Number(accessExpire)
      const re = Number(refreshExpire)
      this.tokens.access.expire = ae
      this.tokens.access.date = new Date(now.getTime() + ae * 1000)
      this.tokens.refresh.expire = re
      this.tokens.refresh.date = new Date(now.getTime() + re * 1000)
      return { ...this.tokens, ok: true }
    } catch (error) {
      return { ...error, ok: false }
    }
  })

  logout = action(async () => {
    try {
      await window.rest.post('/auth/logout', {})
      this.tokens.access = { expire: null, date: null }
      this.tokens.refresh = { expire: null, date: null }
      return { ok: true }
    } catch (error) {
      return { ...error, ok: false }
    }
  })

  refresh = action(async (initialized = false) => {
    if (!this.initialized && !initialized) {
      return { ok: false }
    }
    if (this.authenticated()) {
      return { ok: true }
    }
    try {
      const response = await window.rest.post('/auth/refresh', {})
      const { accessExpire, refreshExpire } = response.data
      const now = new Date()
      const ae = Number(accessExpire)
      const re = Number(refreshExpire)
      this.tokens.access.expire = ae
      this.tokens.access.date = new Date(now.getTime() + ae * 1000)
      this.tokens.refresh.expire = re
      this.tokens.refresh.date = new Date(now.getTime() + re * 1000)
      return { ...this.tokens, ok: true }
    } catch (error) {
      return { ...error, ok: false }
    }
  })

  authenticated = () => {
    if (!this.tokens.access.expire) {
      return false
    }
    if (!this.tokens.refresh.expire) {
      return false
    }
    const now = new Date()
    if (now > this.tokens.access.date) {
      return false
    }
    if (now > this.tokens.refresh.date) {
      return false
    }
    return true
  }

  protect = (fn) => async (...data) => {
    if (!this.authenticated()) {
      const response = await this.refresh()
      if (!response.ok) {
        return response
      }
    }
    return await fn(...data)
  }

  confirm = action(async (token) => {
    try {
      await window.rest.get(`/auth/register/${token}`)
      return { ok: true }
    } catch (error) {
      return { ...error, ok: false }
    }
  })

  register = action(async (email, password) => {
    try {
      await window.rest.post('/auth/register', { email, password })
      return { ok: true }
    } catch (error) {
      return { ...error, ok: false }
    }
  })

  reset = action(async (email) => {
    try {
      await window.rest.post('/auth/reset/request', { email })
      return { ok: true }
    } catch (error) {
      return { ...error, ok: false }
    }
  })

  changePassword = action(async (password, token) => {
    try {
      await window.rest.post('/auth/reset', { password, token })
      return { ok: true }
    } catch (error) {
      return { ...error, ok: false }
    }
  })
}

export const auth = new AuthStore()
