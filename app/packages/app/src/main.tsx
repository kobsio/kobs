import theme from './theme';
import ReactDOM from 'react-dom/client';

import { App } from '@kobsio/core';

import { StrictMode } from 'react';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App theme={theme} plugins={[]} />
  </StrictMode>,
);
