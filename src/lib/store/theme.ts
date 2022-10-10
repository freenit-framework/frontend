import { writable } from 'svelte/store'
import methods from '$lib/methods'
import store from '.'

const defaults = {
  list: {
    data: [],
    page: 0,
    total: 0,
  },

  detail: {},
}

export class ThemeListStore {
  store = writable(defaults.list)
  prefix = ''
  set = this.store.set
  update = this.store.update
  subscribe = this.store.subscribe

  constructor(prefix: string) {
    this.prefix = prefix
  }

  async fetch() {
    await store().auth.refresh()
    const response = await methods.get(`${this.prefix}/themes`)
    if (response.ok) {
      const data = await response.json()
      this.set(data)
      return { ...data, ok: true }
    }
    return response
  }

  async create(fields: any) {
    await store().auth.refresh()
    const response = await methods.post(`${this.prefix}/themes`, fields)
    if (response.ok) {
      const data = await response.json()
      this.set(data)
      return { ...data, ok: true }
    }
    return response
  }

  async active() {
    const response = await methods.get(`${this.prefix}/theme/active`)
    if (response.ok) {
      const data = await response.json()
      this.set(data)
      return { ...data, ok: true }
    }
    return response
  }
}

export class ThemeDetailStore {
  store = writable(defaults.detail)
  prefix = ''
  set = this.store.set
  update = this.store.update
  subscribe = this.store.subscribe

  constructor(prefix: string) {
    this.prefix = prefix
  }

  async fetch(name: string) {
    const response = await methods.get(`${this.prefix}/themes/${name}`)
    if (response.ok) {
      const data = await response.json()
      this.set(data)
      return { ...data, ok: true }
    }
    return response
  }

  async edit(name: string, fields: any) {
    await store().auth.refresh()
    const response = await methods.patch(
      `${this.prefix}/themes/${name}`,
      fields,
    )
    if (response.ok) {
      const data = await response.json()
      this.set(data)
      return { ...data, ok: true }
    }
    return response
  }

  async destroy(name: string) {
    await store().auth.refresh()
    const response = await methods.delete(`${this.prefix}/themes/${name}`)
    if (response.ok) {
      const data = await response.json()
      this.set(data)
      return { ...data, ok: true }
    }
    return response
  }
}

export default function ThemeStore(prefix: string) {
  return {
    list: new ThemeListStore(prefix),
    detail: new ThemeDetailStore(prefix),
  }
}
