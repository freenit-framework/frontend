import React from 'react';
import { connect } from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Paper from 'material-ui/Paper';
import { isLoggedIn } from '../../utils';
import actions from './actions';
import styles from './styles';


function mapStateToProps(state) {
  return {
    token: state.login.token,
  };
}


const Register = React.createClass({
  propTypes: {
    children: React.PropTypes.node,
    dispatch: React.PropTypes.func.isRequired,
  },

  getInitialState() {
    return {};
  },

  componentWillMount() {
    if (isLoggedIn()) {
      history.push('/');
    }
  },

  handleSubmit() {
    let ok = true;
    if (!this.state.email) {
      this.setState({ emailError: 'Can not be empty' });
      ok = false;
    } else {
      this.setState({ emailError: undefined });
    }
    if (!this.state.password) {
      this.setState({ passwordError: 'Can not be empty' });
      ok = false;
    } else {
      this.setState({ passwordError: undefined });
    }
    if (!this.state.passwordRetype) {
      this.setState({ passwordRetypeError: 'Can not be empty' });
      ok = false;
    } else {
      this.setState({ passwordRetypeError: undefined });
    }
    if (ok) {
      this.props.dispatch(
        actions.register(
          this.state.email,
          this.state.password,
        )
      );
    }
  },

  handleEmailChange(event, email) {
    this.setState({ email });
  },

  handlePasswordChange(event, password) {
    this.setState({ password });
  },

  handlePasswordRetypeChange(event, passwordRetype) {
    this.setState({ passwordRetype });
  },

  render() {
    return (
      <div style={styles.root}>
        <Paper style={styles.paper} zDepth={3} >
          <form>
            <h2 style={styles.title}>CREATE ACCOUNT</h2>
            Do not have an Imagine account yet? Create one in 2 minutes!
            <div>
              <TextField
                floatingLabelText="Email"
                onChange={this.handleEmailChange}
                errorText={this.state.emailError}
              />
            </div>
            <div>
              <TextField
                type="password"
                floatingLabelText="Password"
                onChange={this.handlePasswordChange}
                errorText={this.state.passwordError}
              />
            </div>
            <div style={styles.password} >
              <TextField
                type="password"
                floatingLabelText="Re-Type Password"
                onChange={this.handlePasswordRetypeChange}
                errorText={this.state.passwordRetypeError}
              />
            </div>
            <div style={styles.register}>
              <RaisedButton
                label="Register"
                style={styles.register.button}
                onClick={this.handleSubmit}
              />
            </div>
          </form>
        </Paper>
      </div>
    );
  },
});


export default connect(mapStateToProps)(Register);
