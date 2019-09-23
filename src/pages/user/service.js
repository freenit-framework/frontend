import axios from 'axios'
import { API_ROOT, getCookie } from 'utils'


async function create(data) {
  const csrf = getCookie('csrf_access_token')
  const response = await axios.post(
    `${API_ROOT}/user`,
    data,
    {
      headers: {
        'X-CSRF-TOKEN': csrf,
      },
    }
  )
  return response.data
}


async function edit(id, data) {
  const csrf = getCookie('csrf_access_token')
  const response = await axios.patch(
    `${API_ROOT}/user/${id}`,
    data,
    {
      headers: {
        'X-CSRF-TOKEN': csrf,
      },
    }
  )
  return response.data
}


async function remove(id) {
  const csrf = getCookie('csrf_access_token')
  const response = await axios.delete(
    `${API_ROOT}/user/${id}`,
    {
      headers: {
        'X-CSRF-TOKEN': csrf,
      },
    }
  )
  return response.data
}


async function fetch(id) {
  const csrf = getCookie('csrf_access_token')
  const response = await axios.get(
    `${API_ROOT}/user/${id}`,
    {
      headers: {
        'X-CSRF-TOKEN': csrf,
      },
    }
  )
  return response.data
}


async function fetchAll(page = 0, perpage = 10) {
  const csrf = getCookie('csrf_access_token')
  const response = await axios.get(
    `${API_ROOT}/user`,
    {
      headers: {
        'X-CSRF-TOKEN': csrf,
      },
    }
  )
  return response.data
}


export default {
  create,
  remove,
  edit,
  fetch,
  fetchAll,
}
