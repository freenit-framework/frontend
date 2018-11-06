export default (theme, items) => {
  const singleSpacing = 20
  const spacing = singleSpacing * (items - 1)
  return {
    root: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: theme.overrides.Execution.width * items + spacing,
    },
  }
}
