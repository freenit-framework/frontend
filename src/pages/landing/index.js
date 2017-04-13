import React from 'react';
import Paper from 'material-ui/Paper';
import getStyles from './styles';


const Landing = React.createClass({
  contextTypes: {
    muiTheme: React.PropTypes.object.isRequired,
  },

  render() {
    const styles = getStyles(this.context.muiTheme);
    return (
      <Paper style={styles.root}>
        Landing
      </Paper>
    );
  },
});


export default Landing;
