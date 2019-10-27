import React from 'react'
import Template from 'templates/empty'
import styles from './styles'


export default class NoPage extends React.Component {
  render() {
    return (
      <Template.detail style={styles.root}>
				<h1>No Such Page</h1>
      </Template.detail>
    )
  }
}
