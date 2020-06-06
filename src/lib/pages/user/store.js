import service from './service'
import initial from './initial'

export default class UserStore {
  constructor(detail, list) {
    this.detail = detail[0] // eslint-disable-line prefer-destructuring
    this.setDetail = detail[1] // eslint-disable-line prefer-destructuring
    this.list = list[0] // eslint-disable-line prefer-destructuring
    this.setList = list[1] // eslint-disable-line prefer-destructuring
  }

  fetch = async id => {
    try {
      const response = await service.fetch(id)
      const result = {
        ...response,
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

  fetchAll = async (page = 0, perpage = 10) => {
    try {
      const response = await service.fetchAll(page, perpage)
      this.setList(response)

      return {
        ...response,
        ok: true,
      }
    } catch (error) {
      return {
        ...error,
        ok: false,
      }
    }
  }

  create = async data => {
    try {
      const response = await service.create(data)

      return {
        ...response,
        ok: true,
      }
    } catch (error) {
      return {
        ...error,
        ok: false,
      }
    }
  }

  edit = async (id, data) => {
    try {
      const response = await service.edit(id, data)
      const result = {
        ...response,
        ok: true,
      }
      if (this.detail.id === id) {
        this.setDetail(result)
      }
      const listData = { ...this.list }
      listData.data.forEach(user => {
        if (user.id === id) {
          user.email = response.email // eslint-disable-line no-param-reassign
          user.active = response.active // eslint-disable-line no-param-reassign
          user.admin = response.admin // eslint-disable-line no-param-reassign
        }
      })
      this.setList(listData)

      return result
    } catch (error) {
      return {
        ...error,
        ok: false,
      }
    }
  }

  delete = async id => {
    try {
      const response = await service.delete(id)

      return {
        ...response,
        ok: true,
      }
    } catch (error) {
      return {
        ...error,
        ok: false,
      }
    }
  }

  assign = async roleId => {
    try {
      const response = await service.assign(this.detail.id, roleId)
      const data = {
        ...this.detail,
        ok: true,
      }
      data.roles.push(response)
      this.setDetail(data)

      return data
    } catch (error) {
      return {
        ...error,
        ok: false,
      }
    }
  }

  deassign = async roleId => {
    try {
      const result = await service.deassign(this.detail.id, roleId)
      const data = {
        ...this.detail,
        ok: true,
      }
      data.roles = this.detail.roles.filter(
        user => user.id !== result.id,
      )
      this.setDetail(data)

      return data
    } catch (error) {
      return {
        ...error,
        ok: false,
      }
    }
  }
}
