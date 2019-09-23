import { BaseStore } from 'store'
import service from './service'


export default class UserStore extends BaseStore {
  async fetch(id) {
    try {
      const response = await service.fetch(id)
      return {
        ...response,
        ok: true
      }
    } catch (error) {
      return {
        ...error,
        ok: false,
      }
    }
  }

  async fetchAll(page = 0, perpage = 10) {
    try {
      const response = await service.fetchAll(page, perpage)
      this.setList(response)
      return {
        ...response,
        ok: true
      }
    } catch (error) {
      return {
        ...error,
        ok: false,
      }
    }
  }

  async create(data) {
    try {
      const response = await service.create(data)
      return {
        ...response,
        ok: true
      }
    } catch (error) {
      return {
        ...error,
        ok: false,
      }
    }
  }

  async edit(id, data) {
    try {
      const response = await service.edit(id, data)
      return {
        ...response,
        ok: true
      }
    } catch (error) {
      return {
        ...error,
        ok: false,
      }
    }
  }

  async delete(id) {
    try {
      const response = await service.delete(id)
      return {
        ...response,
        ok: true
      }
    } catch (error) {
      return {
        ...error,
        ok: false,
      }
    }
  }
}
