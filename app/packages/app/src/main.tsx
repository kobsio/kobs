import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { App } from '@kobsio/core';
import theme from './theme';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App theme={theme} plugins={[]} />
  </StrictMode>,
);
