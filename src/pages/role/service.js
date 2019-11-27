import { rest } from 'utils'


export default {
  assign: async (role, id) => {
    const response = await rest.post(`/roles/${role}/user`, { id })
    return response.data
  },

  create: async (data) => {
    const response = await rest.post('/roles', data)
    return response.data
  },

  deassign: async (role, id) => {
    const response = await rest.delete(`/roles/${role}/user/${id}`)
    return response.data
  },

  edit: async (id, data) => {
    const response = await rest.patch(`/roles/${id}`, data)
    return response.data
  },

  fetch: async (id) => {
    const response = await rest.get(`/roles/${id}`)
    return response.data
  },

  fetchAll: async (page = 0, perpage = 10) => {
    const response = await rest.get('/roles')
    return response.data
  },

  remove: async (id) => {
    const response = await rest.delete(`/roles/${id}`)
    return response.data
  },
}
