import initial from './initial'

export default class AuthStore {
  timeoutHandler = null

  constructor(detail) {
    this.detail = detail[0]
    this.setDetail = detail[1]
  }

  login = async (email, password) => {
    try {
      const response = await window.rest.post('/auth/login', {email, password})
      const { accessExpire, refreshExpire } = response.data
      const result = {
        accessExpire,
        refreshExpire,
        ok: true,
      }
      this.setDetail(result)

      return result
    } catch (error) {
      const result = {
        ...initial,
        ok: false,
      }
      this.setDetail(result)

      return {
        ...error,
        ...result,
      }
    }
  }

  logout = async () => {
    try {
      await window.rest.post('/auth/logout', {})
      const result = {}
      this.setDetail(result)

      return result
    } catch (error) {
      const result = {
        ok: false,
      }
      this.setDetail(result)

      return {
        ...error,
        ...result,
      }
    }
  }

  refresh = async () => {
    if (this.detail.refreshing) {
      return {
        ...this.detail,
        ok: true,
      }
    }
    try {
      const response = await window.rest.post('/auth/refresh', {})
      const { accessExpire, refreshExpire } = response.data
      const result = {
        ...this.detail,
        accessExpire,
        refreshExpire,
        refreshing: true,
        ok: true,
      }
      this.setDetail(result)
      clearTimeout(this.timeoutHandler)
      this.timeoutHandler = setTimeout(
        () => {
          this.setDetail({
            ...this.detail,
            refreshing: false,
          })
          this.refresh()
        },
        result.accessExpire * 1000,
      )

      return result
    } catch (error) {
      clearTimeout(this.timeoutHandler)
      this.timeoutHandler = null
      const result = {
        ...initial,
        ok: false,
      }
      this.setDetail(result)

      return {
        ...error,
        ...result,
      }
    }
  }

  confirm = async (token) => {
    try {
      await window.rest.get(`/auth/register/${token}`)
      const result = {
        ok: true,
      }
      return result
    } catch (error) {
      return {
        ...error,
        ok: false,
      }
    }
  }

  register = async (email, password) => {
    try {
      const response = await window.rest.post(
        '/auth/register',
        { email, password },
      )
      const { accessExpire, refreshExpire } = response.data
      const result = {
        accessExpire,
        refreshExpire,
        ok: true,
      }
      this.setDetail(result)
      return result
    } catch (error) {
      const result = {
        ...initial,
        ok: false,
      }
      this.setDetail(result)
      return {
        ...error,
        ...result,
      }
    }
  }

  reset = async email => {
    try {
      const response = await window.rest.post('/auth/reset/request', { email })
      const result = {
        ...response.data,
        ok: true,
      }

      return result
    } catch (error) {
      const result = {
        ...error,
        ok: false,
      }

      return result
    }
  }

  changePassword = async (password, token) => {
    try {
      const response = await window.rest.post('/auth/reset', { password, token })
      const result = {
        ...response.data,
        ok: true,
      }

      return result
    } catch (error) {
      const result = {
        ...error,
        ok: false,
      }

      return result
    }
  }
}
