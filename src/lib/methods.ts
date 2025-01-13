const default_headers = { 'content-type': 'application/json' }

export default {
  get: async (url: string, headers = {}) => {
    return await fetch(url, {
      method: 'GET',
      headers: { ...default_headers, ...headers },
    })
  },
  delete: async (url: string, headers = {}) => {
    return await fetch(url, { method: 'DELETE', headers })
  },
  post: async (url: string, data: Record<any, any>, headers = {}) => {
    return await fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { ...default_headers, ...headers },
    })
  },
  patch: async (url: string, data: Record<any, any>, headers = {}) => {
    return await fetch(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: { ...default_headers, ...headers },
    })
  },
}
