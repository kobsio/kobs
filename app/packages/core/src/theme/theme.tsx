import { green, grey } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';

import breakpoints from './breakpoints';
import components from './components';
import typography from './typography';

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
  },
);

export default theme;
