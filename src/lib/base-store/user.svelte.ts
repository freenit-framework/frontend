import { methods } from '..'

export default class UserStore {
  list = $state({ page: 0, perpage: 0, data: [], total: 0 })
  detail = $state({ id: 0, email: '', active: false, admin: false, roles: [] })
  profile = $state({ id: 0, email: '', active: false, admin: false, roles: [] })

  constructor(store, prefix: string) {
    this.store = store
    this.prefix = prefix
  }

  fetchAll = async () => {
    await this.store.auth.refresh_token()
    const response = await methods.get(`${this.prefix}/users`)
    if (response.ok) {
      const data = await response.json()
      this.list = data
      return { ...data, ok: true }
    }
    return response
  }

  create = async (fields: Record<string, any>) => {
    await this.store.auth.refresh_token()
    const response = await methods.post(`${this.prefix}/users`, fields)
    if (response.ok) {
      const data = await response.json()
      this.list = data
      return { ...data, ok: true }
    }
    return response
  }

  fetch = async (id: number) => {
    await this.store.auth.refresh_token()
    const response = await methods.get(`${this.prefix}/users/${id}`)
    if (response.ok) {
      const data = await response.json()
      this.detail = data
      return { ...data, ok: true }
    }
    return response
  }

  edit = async (id: number, fields: Record<string, any>) => {
    await this.store.auth.refresh_token()
    const response = await methods.patch(`${this.prefix}/users/${id}`, fields)
    if (response.ok) {
      const data = await response.json()
      this.detail = data
      return { ...data, ok: true }
    }
    return response
  }

  fetchProfile = async () => {
    await this.store.auth.refresh_token()
    const response = await methods.get(`${this.prefix}/profile`)
    if (response.ok) {
      const data = await response.json()
      this.profile = data
      return { ...data, ok: true }
    }
    return response
  }

  editProfile = async (fields: Record<string, any>) => {
    await this.store.auth.refresh_token()
    const response = await methods.patch(`${this.prefix}/profile`, fields)
    if (response.ok) {
      const data = await response.json()
      this.profile = data
      return { ...data, ok: true }
    }
    return response
  }

  fetchByDomain = async (domain: string) => {
    await this.store.auth.refresh_token()
    const response = await methods.get(`${this.prefix}/domains/${domain}/users`)
    if (response.ok) {
      const data = await response.json()
      this.list = data
      return { ...data, ok: true }
    }
    return response
  }
}
