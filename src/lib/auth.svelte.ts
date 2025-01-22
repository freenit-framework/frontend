import { methods } from '.'

export default class AuthStore {
  access = $state(new Date(0))
  refresh = $state(new Date(0))

  constructor(store, prefix: string) {
    this.store = store
    this.prefix = prefix
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
      this.store.user.profile = data.user
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
      this.store.user.profile = {}
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
    const now = new Date()
    if (now > this.access) {
      const response = await methods.post(`${this.prefix}/auth/refresh`, {})
      if (response.ok) {
        const data = await response.json()
        this.access = new Date(now + data.expire.access)
        this.refresh = new Date(now + data.expire.refresh)
        this.store.user.profile = data.user
        return { ...data, ok: true }
      }
    }
  }
}
