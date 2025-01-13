import methods from '$lib/methods'
import { store } from '.'

export default class UserStore {
  list = $state({})
  detail = $state({})
  profile = $state({})

  constructor(prefix: string) {
    this.prefix = prefix
  }

  fetchAll = async () => {
    await store.auth.refresh_token()
    const response = await methods.get(`${this.prefix}/users`)
    if (response.ok) {
      const data = await response.json()
      this.list = data
      return { ...data, ok: true }
    }
    return response
  }

  create = async (fields: any) => {
    await store.auth.refresh_token()
    const response = await methods.post(`${this.prefix}/users`, fields)
    if (response.ok) {
      const data = await response.json()
      this.list = data
      return { ...data, ok: true }
    }
    return response
  }

  fetch = async (id: number | string) => {
    await store.auth.refresh_token()
    const response = await methods.get(`${this.prefix}/users/${id}`)
    if (response.ok) {
      const data = await response.json()
      this.detail = data
      return { ...data, ok: true }
    }
    return response
  }

  edit = async (id: number | string, fields: any) => {
    await store.auth.refresh_token()
    const response = await methods.patch(`${this.prefix}/users/${id}`, fields)
    if (response.ok) {
      const data = await response.json()
      this.detail = data
      return { ...data, ok: true }
    }
    return response
  }
  
  fetchProfile = async () => {
    await store.auth.refresh_token()
    const response = await methods.get(`${this.prefix}/profile`)
    if (response.ok) {
      const data = await response.json()
      this.profile = data
      return { ...data, ok: true }
    }
    return response
  }

  editProfile = async (fields: any) => {
    await store.auth.refresh_token()
    const response = await methods.patch(`${this.prefix}/profile`, fields)
    if (response.ok) {
      const data = await response.json()
      this.profile = data
      return { ...data, ok: true }
    }
    return response
  }
}
