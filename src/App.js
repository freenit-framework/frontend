import React from 'react'
import { StoreProvider, store } from 'store-provider'
import { BrowserRouter as Router } from 'react-router-dom'
import { ThemeProvider } from '@material-ui/styles'
import { Style } from 'radium'

import Routing from './routing'
import styles from './styles'
import theme from './theme'
import { auth } from './auth'


auth.init('/api/v0')


const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <Style rules={styles} />
        <Router>
          <StoreProvider store={store}>
            <Routing />
          </StoreProvider>
        </Router>
    </ThemeProvider>
  )
}


export default App
