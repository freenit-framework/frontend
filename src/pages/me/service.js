import { rest } from 'utils'


export default {
  edit: async (data) =>{
    const response = await rest.patch('/me', data)
    return response.data
  },

  fetch: async () => {
    const response = await rest.get('/me')
    return response.data
  },
}
