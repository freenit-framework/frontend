import { methods, store } from '.'

export default class AuthStore {
  access = $state(new Date(0))
  refresh = $state(new Date(0))

  constructor(prefix) {
    this.prefix = prefix
    store.auth = this
  }

  login = async (email, password) => {
    const response = await methods.post(`${this.prefix}/auth/login`, {
      email,
      password,
    })
    if (response.ok) {
      const data = await response.json()
      const now = new Date()
      this.access = new Date(now + data.expire.access)
      this.refresh = new Date(now + data.expire.refresh)
      store.user.profile = data.user
      return { ...data, ok: true }
    }
    return response
  }

  logout = async () => {
    const response = await methods.post(`${this.prefix}/auth/logout`)
    if (response.ok) {
      const data = await response.json()
      this.access = new Date()
      this.refresh = new Date()
      store.user.profile = {}
      return { ...data, ok: true }
    }
    return response
  }

  register = async (email, password) => {
    const response = await methods.post(`${this.prefix}/auth/register`, {
      email,
      password,
    })
    if (response.ok) {
      const data = await response.json()
      return { ...data, ok: true }
    }
    return response
  }

  verify = async (verification) => {
    const response = await methods.post(`${this.prefix}/auth/verify`, {
      verification,
    })
    if (response.ok) {
      const data = await response.json()
      return { ...data, ok: true }
    }
    return response
  }

  refresh_token = async () => {
    console.log('refresh_token')
    const now = new Date()
    if (now > this.access) {
      const response = await methods.post(`${this.prefix}/auth/refresh`, {})
      if (response.ok) {
        const data = await response.json()
        this.access = new Date(now + data.expire.access)
        this.refresh = new Date(now + data.expire.refresh)
        store.user.profile = data.user
        return { ...data, ok: true }
      }
    }
  }
}
