import React, { Component } from 'react'
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import store from './store';


class App extends Component {
  render() {
    return (
    <Provider store={store}>
      <BrowserRouter>
        <div>
          Hello World!
        </div>
      </BrowserRouter>
    </Provider>
    )
  }
}


export default App
