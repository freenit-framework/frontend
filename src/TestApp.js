import React from 'react'
import StoreProvider from 'store/provider'
import { MemoryRouter as Router } from 'react-router-dom'
import { ThemeProvider } from '@material-ui/styles'
import { Style } from 'radium'

import Routing from 'routing'
import theme from 'theme'
import styles from 'styles'


function TestApp() {
  return (
    <ThemeProvider theme={theme}>
      <Style rules={styles} />
      <StoreProvider>
        <Router>
          <Routing />
        </Router>
      </StoreProvider>
    </ThemeProvider>
  )
}


export default TestApp
