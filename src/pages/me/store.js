import service from './service'
import initial from './initial'


export default class MeStore {
  constructor(detail) {
    this.detail = detail[0]
    this.setDetail = detail[1]
  }

  fetch = async () => {
    try {
      const response = await service.fetch()
      const result = {
        ...response,
        ok: true
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

  edit = async (data) => {
    try {
      const response = await service.edit(data)
      const result = {
        ...response,
        ok: true
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
