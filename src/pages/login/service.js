import axios from 'axios'
import { API_ROOT } from 'utils'


const login = async function({ email, password }) {
  const response = await axios.post(
    `${API_ROOT}/auth/login`,
    {
      email,
      password,
    },
  )
  return response.data
}


export default { login }
