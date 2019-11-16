import { rest } from 'utils'


export default {
  assign: async (user, id) => {
    const response = await rest.post(`/role/${id}/user`, { id: user })
    return response.data
  },

  deassign: async (user, id) => {
    const response = await rest.delete(`/role/${id}/user/${user}`)
    return response.data
  },

  create: async (data) => {
    const response = await rest.post('/user', data)
    return response.data
  },

  edit: async (id, data) => {
    const response = await rest.patch(`/user/${id}`, data)
    return response.data
  },

  fetch: async (id) => {
    const response = await rest.get(`/user/${id}`)
    return response.data
  },

  fetchAll: async (page = 0, perpage = 10) => {
    const response = await rest.get(
      '/user',
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
    const response = await rest.delete(`/user/${id}`)
    return response.data
  },
}
