import { rest } from 'utils'


export default {
  assign: async (role, id) => {
    const response = await rest.post(`/role/${role}/user`, { id })
    return response.data
  },

  create: async (data) => {
    const response = await rest.post('/role', data)
    return response.data
  },

  deassign: async (role, id) => {
    const response = await rest.delete(`/role/${role}/user/${id}`)
    return response.data
  },

  edit: async (id, data) => {
    const response = await rest.patch(`/role/${id}`, data)
    return response.data
  },

  fetch: async (id) => {
    const response = await rest.get(`/role/${id}`)
    return response.data
  },

  fetchAll: async (page = 0, perpage = 10) => {
    const response = await rest.get('/role')
    return response.data
  },

  remove: async (id) => {
    const response = await rest.delete(`/role/${id}`)
    return response.data
  },
}
