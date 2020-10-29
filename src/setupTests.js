import 'regenerator-runtime/runtime'
import Adapter from '@wojtekmaj/enzyme-adapter-react-17'
import { configure } from 'enzyme'


configure({ adapter: new Adapter() })
