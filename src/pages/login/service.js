import axios from 'axios'


const API_ROOT = 'http://10.0.0.13/api/v0'


const login = async function({ email, password }) {
  try {
    const response = await axios.post(`${API_ROOT}/auth/tokens`, {
      email,
      password,
    }, {
      headers: {
        Accept: 'application/json',
      },
    })
    return response.data
  } catch (error) {
    throw error
  }
}


export default { login }
