import React from 'react'
import { StoreProvider } from 'store-provider'
import { BrowserRouter as Router } from 'react-router-dom'
import { ThemeProvider } from '@material-ui/styles'
import { Style } from 'radium'

import theme from 'theme'
import styles from 'styles'


export default (props) => {
  return (
    <ThemeProvider theme={theme}>
      <Style rules={styles} />
        <Router>
          <StoreProvider>
            {props.children}
          </StoreProvider>
        </Router>
    </ThemeProvider>
  )
}
