import { Components } from '@mui/material';
import { Theme } from '@mui/system';

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

export default components;
