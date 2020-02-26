export default {
  edit: async data => {
    const response = await window.rest.patch('/profile', data)

    return response.data
  },

  fetch: async () => {
    const response = await window.rest.get('/profile')

    return response.data
  },
}
