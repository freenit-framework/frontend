import React from 'react'
import PropTypes from 'prop-types'
import { Switch, Route, MemoryRouter as Router } from 'react-router-dom'
import { ThemeProvider } from '@material-ui/styles'
import { Style } from 'radium'
import StoreProvider from 'store/provider'
import theme from 'theme'
import styles from 'styles'


const TestComponent = (props) => {
  return (
    <ThemeProvider theme={theme}>
      <Style rules={styles} />
      <StoreProvider>
        <Router>
          <Switch>
            <Route exact path={props.path} component={props.component} />
          </Switch>
        </Router>
      </StoreProvider>
    </ThemeProvider>
  )
}


TestComponent.propTypes = {
  path: PropTypes.string.isRequired,
  component: PropTypes.shape({}).isRequired,
}


export default TestComponent
