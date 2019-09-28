import axios from 'axios'
import { API_ROOT, getCookie } from 'utils'


async function edit(data) {
  const csrf = getCookie('csrf_access_token')
  const response = await axios.patch(
    `${API_ROOT}/me`,
    data,
    {
      headers: {
        'X-CSRF-TOKEN': csrf,
      },
    }
  )
  return response.data
}


async function fetch() {
  const csrf = getCookie('csrf_access_token')
  const response = await axios.get(
    `${API_ROOT}/me`,
    {
      headers: {
        'X-CSRF-TOKEN': csrf,
      },
    }
  )
  return response.data
}


export default {
  edit,
  fetch,
}
