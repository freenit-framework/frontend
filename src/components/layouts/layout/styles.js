export default function getStyles(theme, user) {
  const header = theme.appBar.height;
  const footer = theme.footer.height;
  const headerFooter = header + footer;
  const allButContent = headerFooter + (2 * theme.content.padding) + theme.breadcrumbs.height;
  const styles = {
    inactive: {
      color: theme.inactive.color,
    },

    content: {
      fontFamily: 'Roboto, sans-serif',
      padding: `${theme.content.padding}px`,
      height: `calc(100vh - ${allButContent}px)`,
      overflow: 'auto',
      backgroundColor: theme.content.backgroundColor,
    },

    settings: {
      item: {
        cursor: 'pointer',
      },
    },

    footer: {
      height: `${theme.footer.height}px`,
      lineHeight: `${theme.footer.height}px`,
      color: theme.footer.color,
      fontFamily: theme.footer.fontFamily,
      boxShadow: `${theme.footer.boxShadow}`,
      textAlign: 'center',
      backgroundColor: theme.footer.backgroundColor,
    },

    breadcrumbs: {
      height: `${theme.breadcrumbs.height}px`,
      lineHeight: `${theme.breadcrumbs.height}px`,
      textAlign: 'right',
      padding: '0 10px',
      backgroundColor: theme.breadcrumbs.backgroundColor,
      link: {
        color: theme.palette.primary2Color,
      },
    },

    title: {
      cursor: 'pointer',
    },
  };
  if (user && user.login_class === 'manager') {
    styles.appBar = {
      backgroundColor: theme.palette.accent1Color,
    };
  }
  return styles;
}
