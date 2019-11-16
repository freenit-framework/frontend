const center = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}


export default {
  item: {
    marginBottom: 5,
    backgroundColor: '#eee',
  },

  details: {
    marginRight: 20,
  },

  avatar: {
    marginRight: 10,
  },

  center: {
    ...center,
  },

  page: {
    marginLeft: 10,
    marginRight: 10,
  },

  root: {
    padding: 20,
    minHeight: 'calc(100vh - 65px - 40px)',
  },
}
