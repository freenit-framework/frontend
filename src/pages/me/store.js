import { BaseStore } from 'store'
import service from './service'
import initial from './initial'


export default class MeStore extends BaseStore {
  fetch = async (id) => {
    try {
      const response = await service.fetch(id)
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

  edit = async (id, data) => {
    try {
      const response = await service.edit(id, data)
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
