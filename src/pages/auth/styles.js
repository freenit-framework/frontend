const flex = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}


export default {
  root: {
    ...flex,
    height: '100vh',
  },

  paper: {
    ...flex,
    width: 400,
    height: 400,
  },

  button: {
    ...flex,
  },
}
