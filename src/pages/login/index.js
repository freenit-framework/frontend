import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Snackbar from 'material-ui/Snackbar';
import Paper from 'material-ui/Paper';
import { history, errors } from '../../constants';
import { isLoggedIn } from '../../utils';
import actions from './actions';
import styles from './styles';


function mapStateToProps(state) {
  return {
    token: state.login.token,
  };
}


const Login = React.createClass({
  propTypes: {
    dispatch: React.PropTypes.func.isRequired,
  },

  getDefaultProps() {
    return {
      loginClass: 'user',
    };
  },

  getInitialState() {
    return {
      email: '',
      password: '',
    };
  },

  componentWillMount() {
    if (isLoggedIn()) {
      history.push('/');
    }
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.status === 'error') {
      this.setState({ status: 'error', message: nextProps.error });
      this.props.dispatch(actions.reset());
    }
  },

  shouldComponentUpdate() {
    if (isLoggedIn()) {
      history.push('/');
      return false;
    }
    return true;
  },

  handleEmailChange(event) {
    this.setState({ email: event.target.value });
  },

  handlePasswordChange(event) {
    this.setState({ password: event.target.value });
  },

  handleSubmit(event) {
    event.preventDefault();
    this.props.dispatch(
      actions.login(
        this.state.email,
        this.state.password,
      )
    );
  },

  handleNotificationClose() {
    this.setState({ status: '', message: '' });
  },

  render() {
    const notificationOpen = this.state.status === 'error';
    const notification = notificationOpen ? errors.login[this.state.message] : '';
    return (
      <div style={styles.root}>
        <Paper zDepth={3}>
          <form style={styles.form} onSubmit={this.handleSubmit}>
            <h1 style={styles.title}>ImagineVR</h1>
            <div>
              <TextField
                floatingLabelText="Email"
                onChange={this.handleEmailChange}
                autoFocus
                required
              />
            </div>
            <div>
              <TextField
                floatingLabelText="Password"
                type="password"
                onChange={this.handlePasswordChange}
                required
              />
            </div>
            <div style={styles.button}>
              <RaisedButton label="login" type="submit" />
            </div>
          </form>
          <div style={styles.register}>
            Do not have an account?
            <Link style={styles.register.link} to="/register">
              Register
            </Link>
          </div>
        </Paper>
        <Snackbar
          open={notificationOpen}
          message={notification}
          autoHideDuration={4000}
          action="close"
          onActionTouchTap={this.handleNotificationClose}
          onRequestClose={this.handleNotificationClose}
        />
      </div>
    );
  },
});


export default connect(mapStateToProps)(Login);
