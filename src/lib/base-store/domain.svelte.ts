import { methods } from '..'

export default class DomainStore {
  list = $state({ page: 0, perpage: 0, data: [], total: 0 })
  detail = $state({ id: 0, name: '' })

  constructor(store, prefix: string) {
    this.store = store
    this.prefix = prefix
  }

  fetchAll = async (page = 1, perpage = 10) => {
    await this.store.auth.refresh_token()
    const response = await methods.get(`${this.prefix}/domains`, {
      page,
      perpage,
    })
    if (response.ok) {
      const data = await response.json()
      this.list = data
      return { ...data, ok: true }
    }
    return response
  }

  create = async (fields: Record<string, any>) => {
    await this.store.auth.refresh_token()
    const response = await methods.post(`${this.prefix}/domains`, fields)
    if (response.ok) {
      const data = await response.json()
      this.list.data.push(data)
      this.list.total += 1
      return { ...data, ok: true }
    }
    return response
  }

  fetch = async (id: number) => {
    await this.store.auth.refresh_token()
    const response = await methods.get(`${this.prefix}/domains/${id}`)
    if (response.ok) {
      const data = await response.json()
      this.detail = data
      return { ...data, ok: true }
    }
    return response
  }

  edit = async (id: number) => {
    await this.store.auth.refresh_token()
    const response = await methods.patch(`${this.prefix}/domains/${id}`, fields)
    if (response.ok) {
      const data = await response.json()
      this.detail = data
      return { ...data, ok: true }
    }
    return response
  }

  destroy = async (id: number) => {
    await this.store.auth.refresh_token()
    const response = await methods.delete(`${this.prefix}/domains/${id}`)
    if (response.ok) {
      const data = await response.json()
      this.set(data)
      return { ...data, ok: true }
    }
    return response
  }

  assign = async (domain_id: number, user_id: number) => {
    await this.store.auth.refresh_token()
    const response = await methods.post(`${this.prefix}/domains/${domain_id}/${user_id}`, {})
    if (response.ok) {
      const data = await response.json()
      return { ...data, ok: true }
    }
    return response
  }

  deassign = async (domain_id: number, user_id: number) => {
    await this.store.auth.refresh_token()
    const response = await methods.delete(`${this.prefix}/domains/${domain_id}/${user_id}`)
    if (response.ok) {
      const data = await response.json()
      return { ...data, ok: true }
    }
    return response
  }
}
