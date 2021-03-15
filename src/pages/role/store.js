import { makeAutoObservable } from 'mobx'
import { auth } from '../../auth'


export default class RoleStore {
  detail = {
    id: 0,
    users: [],
  }
  list = {
    data: [],
    pages: 0,
    total: 0,
  }

  constructor() {
    makeAutoObservable(this)
  }

  fetch = auth.protect(async id => {
    try {
      const response = await window.rest.get(`/roles/${id}`)
      this.detail = { ...response, ok: true }
      return this.detail
    } catch (error) {
      return { ...error, ok: false }
    }
  })

  fetchAll = auth.protect(async (page = 0, perpage = 10) => {
    try {
      const response = await window.rest.get('/roles')
      this.list = { ...response.data, ok: true }
      return this.list
    } catch (error) {
      return { ...error, ok: false }
    }
  })

  create = auth.protect(async data => {
    try {
      const response = await window.rest.post('/roles', data)
      this.detail = { ...response.data, ok: true }
      this.list.data.push(this.detail)
      return this.detail
    } catch (error) {
      return { ...error, ok: false }
    }
  })

  edit = auth.protect(async (id, data) => {
    try {
      const response = await window.rest.patch(`/roles/${id}`, data)
      const result = { ...response.data, ok: true }
      if (this.detail.id === id) { this.detail = result }
      this.list.data.forEach(user => {
        if (user.id === id) {
          user.email = result.email
          user.active = result.active
          user.admin = result.admin
        }
      })
      return result
    } catch (error) {
      return { ...error, ok: false }
    }
  })

  delete = auth.protect(async id => {
    try {
      const response = await window.rest.delete(`/roles/${id}`)
      return { ...response.data, ok: true }
    } catch (error) {
      return { ...error, ok: false }
    }
  })

  assign = auth.protect(async (userId) => {
    try {
      const response = await window.rest.post(
        `/roles/${this.detail.id}/user`,
        { userId },
      )
      const data = { ...this.detail, ok: true }
      data.users.push(response.data)
      this.detail = data
      return data
    } catch (error) {
      return { ...error, ok: false }
    }
  })

  deassign = auth.protect(async (userId) => {
    try {
      const result = await window.rest.delete(
        `/roles/${this.detail.id}/user/${userId}`
      )
      const data = { ...this.detail, ok: true }
      data.users = this.detail.users.filter(
        user => user.id !== result.id,
      )
      this.detail = data
      return data
    } catch (error) {
      return { ...error, ok: false }
    }
  })
}
