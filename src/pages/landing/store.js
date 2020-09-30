import initial from './initial'


export default class LandingStore {
  constructor(detail) {
    this.detail = detail[0]
    this.setDetail = detail[1]
  }

  send = async () => {
    try {
      const response = await window.rest.post('/landing/form', this.organizer)
      const result = {
        ...response.data,
        ok: true
      }
      this.setDetail(result)
      return result
    } catch (error) {
      const result = {
        ...initial.detail,
        ok: false,
      }
      this.setDetail(result)
      return {
        ...error,
        ...result,
      }
    }
  }
}
