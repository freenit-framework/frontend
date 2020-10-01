import initial from './initial'

export default class RoleStore {
  constructor(detail, list) {
    this.detail = detail[0]
    this.setDetail = detail[1]
    this.list = list[0]
    this.setList = list[1]
  }

  fetch = async id => {
    try {
      const response = await window.rest.get(`/roles/${id}`)
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
      const response = await window.rest.get('/roles')
      this.setList(response.data)
      return {
        ...response.data,
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
      const response = await window.rest.post('/roles', data)
      this.list.data.push(response.data)
      return {
        ...response.data,
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
      const response = await window.rest.patch(`/roles/${id}`, data)
      const result = {
        ...response.data,
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
      const response = await window.rest.delete(`/roles/${id}`)
      return {
        ...response.data,
        ok: true,
      }
    } catch (error) {
      return {
        ...error,
        ok: false,
      }
    }
  }

  assign = async (userId) => {
    try {
      const response = await window.rest.post(
        `/roles/${this.detail.id}/user`,
        { userId },
      )
      const data = {
        ...this.detail,
        ok: true,
      }
      data.users.push(response)
      this.setDetail(data)
      return data
    } catch (error) {
      return {
        ...error,
        ok: false,
      }
    }
  }

  deassign = async (userId) => {
    try {
      const result = await window.rest.delete(
        `/roles/${this.detail.id}/user/${userId}`
      )
      const data = {
        ...this.detail,
        ok: true,
      }
      data.users = this.detail.users.filter(
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
