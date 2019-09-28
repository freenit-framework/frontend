const center = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}


export default {
  root: {
    display: 'block',
    minHeight: 'calc(100vh - 65px - 40px)',
    padding: 20,
  },

  item: {
    marginBottom: 5,
    backgroundColor: '#eee',
  },

  details: {
    marginRight: 20,
  },

  page: {
    marginLeft: 10,
    marginRight: 10,
  },

  center: {
    ...center,
  },

  avatar: {
    marginRight: 10,
  },

  h1: {
    marginBottom: 30,
    color: '#3f51b5',
    small: {
      margin: 0,
    },
    textAlign: 'center',
  },
}
