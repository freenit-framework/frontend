import { methods } from '..'

export default class ThemeStore {
  list = $state({})
  detail = $state({})

  constructor(store, prefix: string) {
    this.store = store
    this.prefix = prefix
  }

  fetchAll = async () => {
    await this.store.auth.refresh_token()
    const response = await methods.get(`${this.prefix}/themes`)
    if (response.ok) {
      const data = await response.json()
      this.list = data
      return { ...data, ok: true }
    }
    return response
  }

  create = async (fields: Record<string, any>) => {
    await this.store.auth.refresh_token()
    const response = await methods.post(`${this.prefix}/themes`, fields)
    if (response.ok) {
      const data = await response.json()
      this.list = data // TODO: check format
      return { ...data, ok: true }
    }
    return response
  }

  active = async () => {
    const response = await methods.get(`${this.prefix}/theme/active`)
    if (response.ok) {
      const data = await response.json()
      this.detail = data
      return { ...data, ok: true }
    }
    return response
  }

  fetch = async (name: string) => {
    const response = await methods.get(`${this.prefix}/themes/${name}`)
    if (response.ok) {
      const data = await response.json()
      this.detail = data
      return { ...data, ok: true }
    }
    return response
  }

  edit = async (name: string, fields: Record<string, fields>) => {
    await this.store.auth.refresh_token()
    const response = await methods.patch(`${this.prefix}/themes/${name}`, fields)
    if (response.ok) {
      const data = await response.json()
      this.detail = data
      return { ...data, ok: true }
    }
    return response
  }

  destroy = async (name: string) => {
    await this.store.auth.refresh_token()
    const response = await methods.delete(`${this.prefix}/themes/${name}`)
    if (response.ok) {
      const data = await response.json()
      return { ...data, ok: true }
    }
    return response
  }
}
