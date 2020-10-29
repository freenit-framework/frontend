const center = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}

const styles = {
  root: {
    ...center,
    height: '100vh',
    width: '100vw',
  },

  content: {
    minHeight: 300,
    minWidth: 300,
  },

  form: {
    ...center,
    flexDirection: 'column',
  },
}


export default styles
