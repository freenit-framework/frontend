import { methods } from '..'

export default class GroupStore {
  store: any
  prefix: string
  list = $state({ page: 0, perpage: 0, data: [] as any[], total: 0 })
  detail = $state({ cn: '', gidNumber: 0, memberUid: [] as string[] })

  constructor(store: any, prefix: string) {
    this.store = store
    this.prefix = prefix
  }

  fetchAll = async (domain: any, page = 1, perpage = 10) => {
    await this.store.auth.refresh_token()
    const response = await methods.get(`${this.prefix}/domains/${domain}/groups`, {
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

  create = async (domain: any, fields: Record<string, any>) => {
    await this.store.auth.refresh_token()
    const response = await methods.post(`${this.prefix}/domains/${domain}/groups`, fields)
    if (response.ok) {
      const data = await response.json()
      this.list.data.push(data)
      this.list.total += 1
      return { ...data, ok: true }
    }
    return response
  }

  fetch = async (domain: any, group: string) => {
    await this.store.auth.refresh_token()
    const response = await methods.get(`${this.prefix}/domains/${domain}/groups/${group}`)
    if (response.ok) {
      const data = await response.json()
      this.detail = data
      return { ...data, ok: true }
    }
    return response
  }

  edit = async (domain: any, group: string, fields: Record<string, any>) => {
    await this.store.auth.refresh_token()
    const response = await methods.patch(`${this.prefix}/domains/${domain}/groups/${group}`, fields)
    if (response.ok) {
      const data = await response.json()
      this.detail = data
      return { ...data, ok: true }
    }
    return response
  }

  destroy = async (domain: any, group: string) => {
    await this.store.auth.refresh_token()
    const response = await methods.delete(`${this.prefix}/domains/${domain}/groups/${group}`)
    if (response.ok) {
      const data = await response.json()
      this.list.data = this.list.data.filter(gr => gr.cn !== group)
      return { ...data, ok: true }
    }
    return response
  }

  assign = async (domain: any, group: string, user_id: number) => {
    await this.store.auth.refresh_token()
    const response = await methods.post(`${this.prefix}/domains/${domain}/groups/${group}/${user_id}`, {})
    if (response.ok) {
      const data = await response.json()
      return { ...data, ok: true }
    }
    return response
  }

  deassign = async (domain: any, group: string, user_id: number) => {
    await this.store.auth.refresh_token()
    const response = await methods.delete(`${this.prefix}/domains/${domain}/groups/${group}/${user_id}`)
    if (response.ok) {
      const data = await response.json()
      return { ...data, ok: true }
    }
    return response
  }
}
