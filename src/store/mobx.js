import { decorate, observable } from 'mobx'
import Auth from 'pages/login/store'
import Todo from 'pages/landing/store'


export default decorate(
  {
    auth: new Auth(),
    todo: new Todo(),
  },
  {
    auth: observable,
    todo: observable,
  },
)
