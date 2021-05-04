import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { ThemeProvider } from '@material-ui/styles'
import { Style } from 'radium'

import { store } from './store'
import { StoreProvider } from './store-provider'
import Routing from './routing'
import theme from './theme'
import styles from './styles'

const App = () => {
  store.auth.init('/api/v0')
  return (
    <ThemeProvider theme={theme}>
      <Style rules={styles} />
      <Router>
        <StoreProvider />
        <Routing />
      </Router>
    </ThemeProvider>
  )
}

export default App
