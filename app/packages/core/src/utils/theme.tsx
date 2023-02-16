import { Components } from '@mui/material';
import { green, grey } from '@mui/material/colors';
import { createTheme, Theme } from '@mui/material/styles';
import { TypographyOptions } from '@mui/material/styles/createTypography';

/**
 * `breakpoints` defines the breakpoints which should be used in our Material UI theme.
 */
const breakpoints = {
  values: {
    lg: 1280,
    md: 960,
    sm: 600,
    xl: 1440,
    xs: 0,
  },
};

/**
 * `components` defines the style of some components in our Material UI theme.
 */
const components: Components<Omit<Theme, 'components'>> = {
  MuiButtonBase: {
    defaultProps: {
      disableRipple: true,
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
        borderRadius: '6px',
        boxShadow: 'rgba(50, 50, 93, 0.025) 0px 2px 5px -1px, rgba(0, 0, 0, 0.05) 0px 1px 3px -1px',
      },
    },
  },
  MuiCardHeader: {
    defaultProps: {
      titleTypographyProps: {
        variant: 'h6',
      },
    },
    styleOverrides: {
      action: {
        marginRight: '-4px',
        marginTop: '-4px',
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: '6px',
      },
    },
  },
  MuiLink: {
    defaultProps: {
      underline: 'hover',
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
      },
    },
  },
};

/**
 * `typography` defines the typography options (`TypographyOptions`) for our Material UI theme.
 */
const typography: TypographyOptions = {
  body1: {
    fontSize: 13,
  },
  button: {
    textTransform: 'none',
  },
  fontFamily: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(','),
  fontSize: 13,
  fontWeightBold: 600,
  fontWeightLight: 300,
  fontWeightMedium: 500,
  fontWeightRegular: 400,
  h1: {
    fontSize: '2rem',
    fontWeight: 600,
    lineHeight: 1.25,
  },
  h2: {
    fontSize: '1.75rem',
    fontWeight: 600,
    lineHeight: 1.25,
  },
  h3: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.25,
  },
  h4: {
    fontSize: '1.125rem',
    fontWeight: 500,
    lineHeight: 1.25,
  },
  h5: {
    fontSize: '1.0625rem',
    fontWeight: 500,
    lineHeight: 1.25,
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.25,
  },
};

/**
 * `ITheme` defines the interface for our Material UI theme with our custom extensions for the footer, header and
 * sidebar. To access these custom properties the theme should be used as follows:
 *
 * ```
 * const theme = useTheme<ITheme>()
 * ```
 */
export interface ITheme extends Theme {
  footer: {
    background: string;
    color: string;
  };
  header: {
    background: string;
    color: string;
    indicator: {
      background: string;
    };
    search: {
      color: string;
    };
  };
  sidebar: {
    background: string;
    badge: {
      background: string;
      color: string;
    };
    color: string;
    footer: {
      background: string;
      color: string;
      online: {
        background: string;
      };
    };
    header: {
      background: string;
      brand: {
        color: string;
      };
      color: string;
    };
  };
}

/**
 * `theme` is the theme which can be used as `theme` in the `ThemeProvider` component. The theme is created via the
 * `createTheme` function and must implement the `ITheme` interface, so that we can access our custom properties as
 * follows:
 *
 * ```
 * const theme = useTheme<ITheme>()
 * ```
 */
const theme = createTheme(
  {
    breakpoints: breakpoints,
    components: components,
    palette: {
      background: {
        default: '#1b2635',
        paper: '#233044',
      },
      mode: 'dark',
      primary: {
        contrastText: '#ffffff',
        main: '#407ad6',
      },
      secondary: {
        contrastText: '#ffffff',
        main: '#4782da',
      },
      text: {
        primary: 'rgba(255, 255, 255, 0.95)',
        secondary: 'rgba(255, 255, 255, 0.5)',
      },
    },
    spacing: 4,
    typography: typography,
  },
  {
    footer: {
      background: '#233044',
      color: grey[300],
    },
    header: {
      background: '#1B2635',
      color: grey[300],
      indicator: {
        background: '#407ad6',
      },
      search: {
        color: grey[200],
      },
    },
    sidebar: {
      background: '#233044',
      badge: {
        background: '#4782da',
        color: '#ffffff',
      },
      color: grey[200],
      footer: {
        background: '#1e2a38',
        color: grey[200],
        online: {
          background: green[500],
        },
      },
      header: {
        background: '#233044',
        brand: {
          color: '#4782da',
        },
        color: grey[200],
      },
    },
  } as ITheme,
);

export default theme;
