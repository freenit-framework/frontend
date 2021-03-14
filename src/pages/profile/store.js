import { makeAutoObservable } from 'mobx'


export default class ProfileStore {
  detail = { id: 0 }

  constructor() {
    makeAutoObservable(this)
  }

  async fetch() {
    try {
      const response = await window.rest.get('/profile')
      this.detail = { ...response.data, ok: true }
      return this.detail
    } catch (error) {
      return { ...error, ok: false }
    }
  }

  async edit(data) {
    try {
      const response = await window.rest.patch('/profile', data)
      this.detail = { ...response.data, ok: true }
      return this.detail
    } catch (error) {
      return { ...error, ok: false }
    }
  }
}
