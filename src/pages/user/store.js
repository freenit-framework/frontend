import { makeAutoObservable, runInAction } from 'mobx'
import { auth } from '../../auth'

class UserStore {
  detail = {
    id: 0,
    email: '',
    roles: [],
  }
  list = {
    data: [],
    page: 0,
    total: 0,
  }

  constructor() {
    makeAutoObservable(this)
  }

  fetch = auth.protect(async (id) => {
    try {
      const response = await window.rest.get(`/users/${id}`)
      runInAction(() => {
        this.detail = { ...response.data, ok: true }
      })
      return this.detail
    } catch (error) {
      return { ...error, ok: false }
    }
  })

  fetchAll = auth.protect(async (Page = 0, PerPage = 10) => {
    try {
      const response = await window.rest.get('/users', {
        headers: { Page, PerPage },
      })
      runInAction(() => {
        this.list = { ...response.data, ok: true }
      })
      return this.list
    } catch (error) {
      return { ...error, ok: false }
    }
  })

  create = auth.protect(async (data) => {
    try {
      const response = await window.rest.post('/users', data)
      runInAction(() => {
        this.list = { ...response.data, ok: true }
      })
      return this.list
    } catch (error) {
      return { ...error, ok: false }
    }
  })

  edit = auth.protect(async (id, data) => {
    try {
      const response = await window.rest.patch(`/users/${id}`, data)
      const result = { ...response.data, ok: true }
      runInAction(() => {
        if (this.detail.id === id) {
          this.detail = result
        }
        this.list.data.forEach((user) => {
          if (user.id === id) {
            user.email = result.email
            user.active = result.active
            user.admin = result.admin
          }
        })
      })
      return this.list
    } catch (error) {
      return { ...error, ok: false }
    }
  })

  destroy = auth.protect(async (id) => {
    try {
      const response = await window.rest.delete(`/users/${id}`)
      runInAction(() => {
        this.detail = { ...response.data, ok: true }
      })
      return this.detail
    } catch (error) {
      return { ...error, ok: false }
    }
  })

  assign = auth.protect(async (roleId) => {
    try {
      const response = await window.rest.post(`/roles/${roleId}/user`, {
        id: this.detail.id,
      })
      const data = { ...this.detail, ok: true }
      runInAction(() => {
        data.roles.push(response.data)
        this.detail = data
      })
      return data
    } catch (error) {
      return { ...error, ok: false }
    }
  })

  deassign = auth.protect(async (roleId) => {
    try {
      const result = await window.rest.delete(
        `/roles/${roleId}/user/${this.detail.id}`
      )
      const data = { ...this.detail, ok: true }
      runInAction(() => {
        data.roles = this.detail.roles.filter(
          (user) => user.id !== result.data.id
        )
        this.detail = data
      })
      return this.detail
    } catch (error) {
      return { ...error, ok: false }
    }
  })
}

export default new UserStore()
