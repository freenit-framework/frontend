import { observable, action } from 'mobx'
import { auth } from '../../auth'

class ProfileStore {
  detail = observable({ id: 0 })

  fetch = action(
    auth.protect(async () => {
      try {
        const response = await window.rest.get('/profile')
        this.detail = { ...response.data, ok: true }
        return this.detail
      } catch (error) {
        return { ...error, ok: false }
      }
    })
  )

  edit = action(
    auth.protect(async (data) => {
      try {
        const response = await window.rest.patch('/profile', data)
        this.detail = { ...response.data, ok: true }
        return this.detail
      } catch (error) {
        return { ...error, ok: false }
      }
    })
  )
}

export default new ProfileStore()
