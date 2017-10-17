export default (theme) => {
  const style = {
    center: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: `calc(100vh - ${theme.appBar.height}px)`,
    },
  };
  return style;
};
