import { methods } from '..'

export default class GroupStore {
  list = $state({ page: 0, perpage: 0, data: [], total: 0 })
  detail = $state({ cn: '', gidNumber: 0, memberUid: [] })

  constructor(store, prefix: string) {
    this.store = store
    this.prefix = prefix
  }

  fetchAll = async (domain, page = 1, perpage = 10) => {
    await this.store.auth.refresh_token()
    const response = await methods.get(`${this.prefix}/groups/${domain}`, {
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

  create = async (domain, fields: Record<string, any>) => {
    await this.store.auth.refresh_token()
    const response = await methods.post(`${this.prefix}/groups/${domain}`, fields)
    if (response.ok) {
      const data = await response.json()
      this.list.data.push(data)
      this.list.total += 1
      return { ...data, ok: true }
    }
    return response
  }

  fetch = async (domain, group: string) => {
    await this.store.auth.refresh_token()
    const response = await methods.get(`${this.prefix}/groups/${domain}/${group}`)
    if (response.ok) {
      const data = await response.json()
      this.detail = data
      return { ...data, ok: true }
    }
    return response
  }

  edit = async (domain, group: string) => {
    await this.store.auth.refresh_token()
    const response = await methods.patch(`${this.prefix}/groups/${domain}/${group}`, fields)
    if (response.ok) {
      const data = await response.json()
      this.detail = data
      return { ...data, ok: true }
    }
    return response
  }

  destroy = async (domain, group: string) => {
    await this.store.auth.refresh_token()
    const response = await methods.delete(`${this.prefix}/groups/${domain}/${group}`)
    if (response.ok) {
      const data = await response.json()
      this.set(data)
      return { ...data, ok: true }
    }
    return response
  }

  assign = async (domain, group: string, user_id: number) => {
    await this.store.auth.refresh_token()
    const response = await methods.post(`${this.prefix}/groups/${domain}/${group}/${user_id}`, {})
    if (response.ok) {
      const data = await response.json()
      return { ...data, ok: true }
    }
    return response
  }

  deassign = async (domain, group: str, user_id: number) => {
    await this.store.auth.refresh_token()
    const response = await methods.delete(`${this.prefix}/groups/${domain}/${group}/${user_id}`)
    if (response.ok) {
      const data = await response.json()
      return { ...data, ok: true }
    }
    return response
  }
}
