import { rest } from 'utils'


export default {
  assign: async (user, id) => {
    const response = await rest.post(`/roles/${id}/user`, { id: user })
    return response.data
  },

  deassign: async (user, id) => {
    const response = await rest.delete(`/roles/${id}/user/${user}`)
    return response.data
  },

  create: async (data) => {
    const response = await rest.post('/users', data)
    return response.data
  },

  edit: async (id, data) => {
    const response = await rest.patch(`/users/${id}`, data)
    return response.data
  },

  fetch: async (id) => {
    const response = await rest.get(`/users/${id}`)
    return response.data
  },

  fetchAll: async (page = 0, perpage = 10) => {
    const response = await rest.get(
      '/users',
      {
        headers: {
          Page: page,
          PerPage: perpage,
        },
      }
    )
    return response.data
  },

  remove: async (id) => {
    const response = await rest.delete(`/users/${id}`)
    return response.data
  },
}
