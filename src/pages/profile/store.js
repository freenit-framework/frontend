import initial from './initial'

export default class ProfileStore {
  constructor(detail) {
    this.detail = detail[0]
    this.setDetail = detail[1]
  }

  fetch = async () => {
    try {
      const response = await window.rest.get('/profile')
      const result = {
        ...response.data,
        ok: true,
      }
      this.setDetail(result)

      return result
    } catch (error) {
      const result = {
        ok: false,
      }
      this.setDetail({
        ...initial.detail,
        ...result,
      })

      return {
        ...error,
        ...result,
      }
    }
  }

  edit = async data => {
    try {
      const response = await window.rest.patch('/profile', data)
      const result = {
        ...response.data,
        ok: true,
      }
      this.setDetail(result)

      return result
    } catch (error) {
      return {
        ...error,
        ok: false,
      }
    }
  }
}
