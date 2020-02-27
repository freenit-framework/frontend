import { rest } from '../../utils'

export default {
  edit: async data => {
    const response = await rest.patch('/profile', data)

    return response.data
  },

  fetch: async () => {
    const response = await rest.get('/profile')

    return response.data
  },
}
