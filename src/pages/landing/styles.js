import backgroundImage from './background.jpg';


const getStyles = (
  theme = {
    appBar: { height: 30 },
    palette: { primary2Color: 'white' },
  },
) => ({
  header: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },

  page: {
    width: '100%',
    height: '100vh',
    backgroundImage: `url("${backgroundImage}")`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
  },

  content: {
    height: `calc(100vh - ${theme.appBar.height}px)`,
    overflow: 'auto',
  },

  age: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
});


export default getStyles;
