import { makeAutoObservable, runInAction } from 'mobx'
import { auth } from '../../auth'

class ProfileStore {
  detail = { id: 0 }

  constructor() {
    makeAutoObservable(this)
  }

  fetch = auth.protect(async () => {
    try {
      const response = await window.rest.get('/profile')
      runInAction(() => {
        this.detail = { ...response.data, ok: true }
      })
      return this.detail
    } catch (error) {
      return { ...error, ok: false }
    }
  })

  edit = auth.protect(async (data) => {
    try {
      const response = await window.rest.patch('/profile', data)
      runInAction(() => {
        this.detail = { ...response.data, ok: true }
      })
      return this.detail
    } catch (error) {
      return { ...error, ok: false }
    }
  })
}

export default new ProfileStore()
