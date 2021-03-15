import { makeAutoObservable } from 'mobx'
import { auth } from 'auth'


export default class ProfileStore {
  detail = { id: 0 }

  constructor() {
    makeAutoObservable(this)
  }

  fetch = auth.protect(async () => {
    try {
      const response = await window.rest.get('/profile')
      this.detail = { ...response.data, ok: true }
      return this.detail
    } catch (error) {
      return { ...error, ok: false }
    }
  })

  edit = auth.protect(async (data) => {
    try {
      const response = await window.rest.patch('/profile', data)
      this.detail = { ...response.data, ok: true }
      return this.detail
    } catch (error) {
      return { ...error, ok: false }
    }
  })
}
