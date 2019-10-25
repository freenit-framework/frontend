import axios from 'axios'
import { API_ROOT, getCookie } from 'utils'


export default {
  assign: async (user, id) => {
    const csrf = getCookie('csrf_access_token')
    const response = await axios.post(
      `${API_ROOT}/role/${id}/user`,
      { id: user },
      { headers: { 'X-CSRF-TOKEN': csrf } },
    )
    return response.data
  },

  deassign: async (user, id) => {
    const csrf = getCookie('csrf_access_token')
    const response = await axios.delete(
      `${API_ROOT}/role/${id}/user/${user}`,
      { headers: { 'X-CSRF-TOKEN': csrf } },
    )
    return response.data
  },

  create: async (data) => {
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
  },

  edit: async (id, data) => {
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
  },

  fetch: async (id) => {
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
  },

  fetchAll: async (page = 0, perpage = 10) => {
    const csrf = getCookie('csrf_access_token')
    const response = await axios.get(
      `${API_ROOT}/user`,
      {
        headers: {
          'X-CSRF-TOKEN': csrf,
          Page: page,
          PerPage: perpage,
        },
      }
    )
    return response.data
  },

  remove: async (id) => {
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
  },
}
