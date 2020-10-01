import initial from './initial'


export default class UserStore {
  constructor(detail, list) {
    this.detail = detail[0]
    this.setDetail = detail[1]
    this.list = list[0]
    this.setList = list[1]
  }

  fetch = async id => {
    try {
      const response = await window.rest.get(`/users/${id}`)
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

  fetchAll = async (page = 0, perpage = 10) => {
    try {
      const response = await window.rest.get(
        '/users',
        {
          headers: {
            Page: page,
            PerPage: perpage,
          },
        },
      )
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
      const response = await window.rest.post('/users', data)
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
      const response = await window.rest.patch(`/users/${id}`, data)
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
          user.email = response.email
          user.active = response.active
          user.admin = response.admin
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
      const response = await window.rest.delete(`/users/${id}`)
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

  assign = async roleId => {
    try {
      const response = await window.rest.post(
        `/roles/${roleId}/user`,
        { id: this.detail.id },
      )
      const data = {
        ...this.detail,
        ok: true,
      }
      data.roles.push(response.data)
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
      const result = await window.rest.delete(
        `/roles/${roleId}/user/${this.detail.id}`,
      )
      const data = {
        ...this.detail,
        ok: true,
      }
      data.roles = this.detail.roles.filter(
        user => user.id !== result.data.id,
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
