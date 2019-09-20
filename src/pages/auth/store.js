import service from './service'
import { BaseStore } from 'store'


export default class AuthStore extends BaseStore {
  login = async (email, password) => {
    try {
      const response = await service.login(email, password)
      this.setDetail({ auth: true })
      return {
        ...response,
        ok: true,
      }
    } catch (error) {
      this.setDetail({ auth: false })
      return {
        ...error,
        ok: false,
      }
    }
  }
}
