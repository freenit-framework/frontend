import axios from 'axios'


const API_ROOT = ' http://backend.thinker.my.domain:5000/api/v0'


const login = async function({ email, password }) {
  const response = await axios.post(
    `${API_ROOT}/auth/tokens`,
    {
      email,
      password,
    }
  )
  return response.data
}


export default { login }
