export default (theme, items) => {
  const width = theme.overrides.Execution ? theme.overrides.Execution.width : '100%'
  return {
    root: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width,
    },
  }
}
