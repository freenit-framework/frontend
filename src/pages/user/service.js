export default {
  assign: async (user, id) => {
    const response = await window.rest.post(`/roles/${id}/user`, { id: user })
    return response.data
  },

  deassign: async (user, id) => {
    const response = await window.rest.delete(`/roles/${id}/user/${user}`)
    return response.data
  },

  create: async data => {
    const response = await window.rest.post('/users', data)
    return response.data
  },

  edit: async (id, data) => {
    const response = await window.rest.patch(`/users/${id}`, data)
    return response.data
  },

  fetch: async id => {
    const response = await window.rest.get(`/users/${id}`)
    return response.data
  },

  fetchAll: async (page = 0, perpage = 10) => {
    const response = await window.rest.get(
      '/users',
      {
        headers: {
          Page: page,
          PerPage: perpage,
        },
      },
    )
    return response.data
  },

  remove: async id => {
    const response = await window.rest.delete(`/users/${id}`)
    return response.data
  },
}
