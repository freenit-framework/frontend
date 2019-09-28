import axios from 'axios'
import { API_ROOT, getCookie } from 'utils'


async function create(data) {
  const csrf = getCookie('csrf_access_token')
  const response = await axios.post(
    `${API_ROOT}/role`,
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
    `${API_ROOT}/role/${id}`,
    data,
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
    `${API_ROOT}/role/${id}`,
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
    `${API_ROOT}/role`,
    {
      headers: {
        'X-CSRF-TOKEN': csrf,
        Page: page,
        PerPage: perpage,
      },
    }
  )
  return response.data
}


async function remove(id) {
  const csrf = getCookie('csrf_access_token')
  const response = await axios.delete(
    `${API_ROOT}/role/${id}`,
    {
      headers: {
        'X-CSRF-TOKEN': csrf,
      },
    }
  )
  return response.data
}


async function assign(role, id) {
  const csrf = getCookie('csrf_access_token')
  const response = await axios.post(
    `${API_ROOT}/role/${role}/user`,
    { id },
    { headers: { 'X-CSRF-TOKEN': csrf } },
  )
  return response.data
}


async function deassign(role, id) {
  const csrf = getCookie('csrf_access_token')
  const response = await axios.delete(
    `${API_ROOT}/role/${role}/user/${id}`,
    { headers: { 'X-CSRF-TOKEN': csrf } },
  )
  return response.data
}


export default {
  assign,
  create,
  deassign,
  edit,
  fetch,
  fetchAll,
  remove,
}
