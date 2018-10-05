import axios from 'axios'
import { API_ROOT, getCookie } from 'utils'


async function logout() {
  const csrf = getCookie('csrf_access_token')
  const response = await axios.post(`${API_ROOT}/auth/logout`, {}, {
    headers: {
      'X-CSRF-TOKEN': csrf,
    },
  })
  return response.data
}


async function me() {
  const response = await axios.get(`${API_ROOT}/me`)
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
  logout,
  me,
  refresh,
}
