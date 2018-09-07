import axios from 'axios'
import { API_ROOT } from 'local-conf'


const me = async function() {
  const response = await axios.post(`${API_ROOT}/me`)
  return response.data
}


export default { me }
