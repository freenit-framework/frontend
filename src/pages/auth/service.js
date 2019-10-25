import axios from 'axios'
import { API_ROOT, getCookie } from 'utils'


export default {
  login: async (email, password) => {
    const response = await axios.post(
      `${API_ROOT}/auth/login`,
      { email, password },
    )
    return response.data
  },

  logout: async () => {
    const csrf = getCookie('csrf_access_token')
    const response = await axios.post(
    `${API_ROOT}/auth/logout`,
    {},
    {
      headers: {
        'X-CSRF-TOKEN': csrf,
      },
    })
    return response.data
  },

  refresh: async () => {
    const csrf = getCookie('csrf_refresh_token')
    const response = await axios.post(
    `${API_ROOT}/auth/refresh`,
    {},
    {
      headers: {
        'X-CSRF-TOKEN': csrf,
      },
    })
    return response.data
  },

  register: async (email, password) => {
    const response = await axios.post(
      `${API_ROOT}/auth/register`,
      { email, password },
    )
    return response.data
  },
}
