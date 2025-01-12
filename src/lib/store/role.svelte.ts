import methods from '$lib/methods'
import { store } from '.'

export default class RoleStore {
  list = $state({})
  detail = $state({})

  constructor(prefix: string) {
    this.prefix = prefix
  }

  fetchAll = async (page = 1, perpage = 10) => {
    await store.auth.refresh_token()
    const response = await methods.get(`${this.prefix}/roles`, {
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

  create = async (fields: any) => {
    await store.auth.refresh_token()
    const response = await methods.post(`${this.prefix}/roles`, fields)
    if (response.ok) {
      const data = await response.json()
      return { ...data, ok: true }
    }
    return response
  }

  fetch = async (id: number | string) => {
    await store.auth.refresh_token()
    const response = await methods.get(`${this.prefix}/roles/${id}`)
    if (response.ok) {
      const data = await response.json()
      this.detail = data
      return { ...data, ok: true }
    }
    return response
  }

  edit = async (id: number | string, fields: any) => {
    await store.auth.refresh_token()
    const response = await methods.patch(`${this.prefix}/roles/${id}`, fields)
    if (response.ok) {
      const data = await response.json()
      this.detail = data
      return { ...data, ok: true }
    }
    return response
  }

  destroy = async (id: number | string) => {
    await store().auth.refresh_token()
    const response = await methods.delete(`${this.prefix}/roles/${id}`)
    if (response.ok) {
      const data = await response.json()
      this.set(data)
      return { ...data, ok: true }
    }
    return response
  }

  assign = async (role_id: number | string, user_id: number | string) => {
    await store().auth.refresh_token()
    const response = await methods.post(`${this.prefix}/roles/${role_id}/${user_id}`, {})
    if (response.ok) {
      const data = await response.json()
      return { ...data, ok: true }
    }
    return response
  }

  deassign = async (role_id: number | string, user_id: number | string) => {
    await store().auth.refresh_refresh()
    const response = await methods.delete(`${this.prefix}/roles/${role_id}/${user_id}`)
    if (response.ok) {
      const data = await response.json()
      return { ...data, ok: true }
    }
    return response
  }
}
