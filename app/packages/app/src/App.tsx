import { CssBaseline } from '@mui/material';
import React from 'react';
import { ThemeProvider } from '@emotion/react';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { MyFirstButton, MySecondButton } from '@kobsio/core';
import theme from './theme';

const App: React.FunctionComponent = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MyFirstButton />
      <MySecondButton />
    </ThemeProvider>
  );
};

export default App;
