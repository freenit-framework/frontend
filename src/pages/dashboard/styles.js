export default (theme, items) => {
  const width = theme.overrides.Execution ? theme.overrides.Execution.width : '100%'
  const singleSpacing = 20
  const spacing = singleSpacing * (items - 1)
  return {
    root: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width,
    },
  }
}
