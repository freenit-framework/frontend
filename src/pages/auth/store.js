import { makeAutoObservable } from 'mobx'


export default class AuthStore {
  constructor() {
    makeAutoObservable(this)
  }

  confirm = async (token) => {
    try {
      await window.rest.get(`/auth/register/${token}`)
      return { ok: true }
    } catch (error) {
      return { ...error, ok: false }
    }
  }

  register = async (email, password) => {
    try {
      await window.rest.post('/auth/register', { email, password })
      return { ok: true }
    } catch (error) {
      return { ...error, ok: false }
    }
  }

  reset = async email => {
    try {
      await window.rest.post('/auth/reset/request', { email })
      return { ok: true }
    } catch (error) {
      return { ...error, ok: false }
    }
  }

  changePassword = async (password, token) => {
    try {
      await window.rest.post('/auth/reset', { password, token })
      return { ok: true }
    } catch (error) {
      return { ...error, ok: false }
    }
  }
}
