import axios from 'axios'
import { API_ROOT, getCookie } from 'utils'


const me = async function() {
  const response = await axios.get(`${API_ROOT}/me`)
  return response.data
}


const refresh = async function() {
  const csrf = getCookie('csrf_refresh_token')
  const response = await axios.post(`${API_ROOT}/auth/refresh`, {}, {
    headers: {
      'X-CSRF-TOKEN': csrf,
    },
  })
  return response.data
}


export default {
  me,
  refresh,
}
