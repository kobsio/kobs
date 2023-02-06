import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    background: {
      default: '#1b2635',
      paper: '#233044',
    },
    error: {
      main: '#f44336',
    },
    info: {
      main: '#29b6f6',
    },
    primary: {
      main: '#407ad6',
    },
    secondary: {
      main: '#4782da',
    },
    success: {
      main: '#66bb6a',
    },
    text: {
      primary: 'rgba(255,255,255,0.95)',
    },
    warning: {
      main: '#ffa726',
    },
  },
});

export default theme;
