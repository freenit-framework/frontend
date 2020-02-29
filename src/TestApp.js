import React from 'react'
import PropTypes from 'prop-types'
import StoreProvider from './lib/store/provider'
import { MemoryRouter as Router } from 'react-router-dom'
import { ThemeProvider } from '@material-ui/styles'
import { createMuiTheme } from '@material-ui/core/styles'

import Routing from 'routing'

window.rest.get = jest.fn((url) => {
  if (url === '/events') {
    const data = {
      data: {
        data: [],
        total: 0,
        pages: 1,
      },
    }
    return data
  } else if (url === '/profile') {
    const data = {
      data: {
        id: 1,
        email: 'admin@example.com',
        admin: true,
      },
    }
    return data
  }
})
window.rest.post = jest.fn(() => ({}))
window.rest.patch = jest.fn(() => ({}))
window.rest.delete = jest.fn(() => ({}))

const TestApp = (props) => {
  return (
    <ThemeProvider theme={createMuiTheme()}>
      <Router initialEntries={[props.path]} initialIndex={0}>
        <StoreProvider>
          <Routing />
        </StoreProvider>
      </Router>
    </ThemeProvider>
  )
}


TestApp.propTypes = {
  path: PropTypes.string.isRequired,
}


export default TestApp
