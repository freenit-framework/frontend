import { writable } from 'svelte/store'
import methods from '$lib/methods'
import store from '.'

const defaults = {
  list: {
    data: [],
    page: 0,
    total: 0,
  },

  detail: {
    id: 0,
    email: '',
    active: false,
    admin: false,
    roles: [],
  },

  profile: {},
}
defaults.profile = defaults.detail

export class UserListStore {
  store = writable(defaults.list)
  prefix = ''
  set = this.store.set
  update = this.store.update
  subscribe = this.store.subscribe

  constructor(prefix: string) {
    const { set, update, subscribe } = writable(defaults.list)
    this.set = set
    this.update = update
    this.subscribe = subscribe
    this.prefix = prefix
  }

  async fetch() {
    await store().auth.refresh()
    const response = await methods.get(`${this.prefix}/users`)
    if (response.ok) {
      const data = await response.json()
      this.set(data)
      return { ...data, ok: true }
    }
    return response
  }

  async create(fields: any) {
    await store().auth.refresh()
    const response = await methods.post(`${this.prefix}/users`, fields)
    if (response.ok) {
      const data = await response.json()
      this.set(data)
      return { ...data, ok: true }
    }
    return response
  }
}

export class UserDetailStore {
  store = writable(defaults.detail)
  prefix = ''
  set = this.store.set
  update = this.store.update
  subscribe = this.store.subscribe

  constructor(prefix: string) {
    this.prefix = prefix
  }

  async fetch(id: number | string) {
    await store().auth.refresh()
    const response = await methods.get(`${this.prefix}/users/${id}`)
    if (response.ok) {
      const data = await response.json()
      this.set(data)
      return { ...data, ok: true }
    }
    return response
  }

  async edit(id: number | string, fields: any) {
    await store().auth.refresh()
    const response = await methods.patch(`${this.prefix}/users/${id}`, fields)
    if (response.ok) {
      const data = await response.json()
      this.set(data)
      return { ...data, ok: true }
    }
    return response
  }
}

export class ProfileStore {
  store = writable(defaults.profile)
  prefix = ''
  set = this.store.set
  update = this.store.update
  subscribe = this.store.subscribe

  constructor(prefix: string) {
    this.prefix = prefix
  }

  async fetch() {
    await store().auth.refresh()
    const response = await methods.get(`${this.prefix}/profile`)
    if (response.ok) {
      const data = await response.json()
      this.set(data)
      return { ...data, ok: true }
    }
    return response
  }

  async edit(fields: any) {
    await store().auth.refresh()
    const response = await methods.patch(`${this.prefix}/profile`, fields)
    if (response.ok) {
      const data = await response.json()
      this.set(data)
      return { ...data, ok: true }
    }
    return response
  }
}

export default function UserStore(prefix: string) {
  return {
    list: new UserListStore(prefix),
    detail: new UserDetailStore(prefix),
    profile: new ProfileStore(prefix),
  }
}
