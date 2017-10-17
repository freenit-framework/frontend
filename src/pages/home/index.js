import React from 'react';
import Paper from 'material-ui/Paper';
import Template from '../../templates/default';
import AuthenticatedComponent from '../../components/atoms/authenticated-component';


class Home extends AuthenticatedComponent {
  render() {
    return (
      <Template>
        <Paper>
          Home
        </Paper>
      </Template>
    );
  }
}


export default Home;
