export const API_ROOT = '/api/v0'


export const getCookie = (name) => {
  var value = "; " + document.cookie
  var parts = value.split("; " + name + "=")
  if (parts.length === 2) return parts.pop().split(";").shift()
}


export const errorResponse = (response) => {
  if (!response) {
    return {
      message: '',
    }
  }
  if (response.message) {
    return {
      message: response.message,
    }
  }
  if (response.response) {
    const { data, statusText } = response.response
    if (data && data.status) {
      return {
        message: data.status,
      }
    }
    return {
      message: statusText,
    }
  }
  return {
    message: '',
  }
}
