function getStyles(theme) {
  const styles = {
    root: {
      height: 300 - theme.appBar.height,
    },
  };
  return styles;
}

export default getStyles;
