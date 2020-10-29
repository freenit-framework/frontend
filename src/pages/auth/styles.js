const flex = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}

const styles = {
  root: {
    ...flex,
    height: '100vh',
  },

  paper: {
    ...flex,
    width: 400,
    height: 400,
    textAlign: 'center',
  },

  button: {
    ...flex,
    marginBottom: 10,
  },

  form: {
    ...flex,
    flexDirection: 'column',
  },
}


export default styles
