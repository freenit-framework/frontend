import axios from 'axios'
import { API_ROOT } from 'utils'


const me = async function() {
  const response = await axios.get(`${API_ROOT}/me`)
  return response.data
}


export default { me }
