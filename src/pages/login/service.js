import axios from 'axios'
import { API_ROOT, getCookie } from 'utils'


async function login({ email, password }) {
  const response = await axios.post(
    `${API_ROOT}/auth/login`,
    {
      email,
      password,
    },
  )
  return response.data
}


async function refresh() {
  const csrf = getCookie('csrf_refresh_token')
  const response = await axios.post(`${API_ROOT}/auth/refresh`, {}, {
    headers: {
      'X-CSRF-TOKEN': csrf,
    },
  })
  return response.data
}


export default {
  login,
  refresh,
}
