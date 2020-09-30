export default {
  assign: async (role, id) => {
    const response = await window.rest.post(`/roles/${role}/user`, { id })
    return response.data
  },

  create: async data => {
    const response = await window.rest.post('/roles', data)
    return response.data
  },

  deassign: async (role, id) => {
    const response = await window.rest.delete(`/roles/${role}/user/${id}`)
    return response.data
  },

  edit: async (id, data) => {
    const response = await window.rest.patch(`/roles/${id}`, data)
    return response.data
  },

  fetch: async id => {
    const response = await window.rest.get(`/roles/${id}`)
    return response.data
  },

  fetchAll: async () => {
    const response = await window.rest.get('/roles')
    return response.data
  },

  remove: async id => {
    const response = await window.rest.delete(`/roles/${id}`)
    return response.data
  },
}
