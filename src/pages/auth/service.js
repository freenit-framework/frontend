import { rest } from 'utils'


export default {
  login: async (email, password) => {
    const response = await rest.post('/auth/login', { email, password })
    return response.data
  },

  logout: async () => {
    const response = await rest.post('/auth/logout', {})
    return response.data
  },

  refresh: async () => {
    const response = await rest.post('/auth/refresh', {})
    return response.data
  },

  register: async (email, password) => {
    const response = await rest.post('/auth/register', { email, password })
    return response.data
  },
}
