import { makeAutoObservable, runInAction } from 'mobx'
import { rest } from './utils'

class AuthStore {
  tokens = {
    access: {
      expire: null,
      date: null,
    },
    refresh: {
      expire: null,
      data: null,
    },
  }
  initialized = false

  constructor() {
    makeAutoObservable(this)
  }

  init = async (api) => {
    window.rest = rest(api)
    window.rest.API_ROOT = api
    runInAction(() => {
      this.initialized = true
    })
    return await this.refresh(true)
  }

  login = async (email, password) => {
    const formData = new FormData()
    formData.append('username', email)
    formData.append('password', password)
    try {
      const response = await window.rest.post('/auth/login', formData)
      const now = new Date()
      const ae = 3600
      const re = 720000
      runInAction(() => {
        this.tokens.access.expire = ae
        this.tokens.access.date = new Date(now.getTime() + ae * 1000)
        this.tokens.refresh.expire = re
        this.tokens.refresh.date = new Date(now.getTime() + re * 1000)
      })
      return { ...this.tokens, ok: true }
    } catch (error) {
      return { ...error, ok: false }
    }
  }

  logout = async () => {
    try {
      await window.rest.post('/auth/logout', {})
      runInAction(() => {
        this.tokens.access = { expire: null, date: null }
        this.tokens.refresh = { expire: null, date: null }
      })
      return { ok: true }
    } catch (error) {
      return { ...error, ok: false }
    }
  }

  refresh = async (initialized = false) => {
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
      runInAction(() => {
        this.tokens.access.expire = ae
        this.tokens.access.date = new Date(now.getTime() + ae * 1000)
        this.tokens.refresh.expire = re
        this.tokens.refresh.date = new Date(now.getTime() + re * 1000)
      })
      return { ...this.tokens, ok: true }
    } catch (error) {
      return { ...error, ok: false }
    }
  }

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

  confirm = async (token) => {
    try {
      await window.rest.get(`/auth/register/${token}`)
      return { ok: true }
    } catch (error) {
      return { ...error, ok: false }
    }
  }

  register = async (email, password) => {
    try {
      await window.rest.post('/auth/register', { email, password })
      return { ok: true }
    } catch (error) {
      return { ...error, ok: false }
    }
  }

  reset = async (email) => {
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

export const auth = new AuthStore()
