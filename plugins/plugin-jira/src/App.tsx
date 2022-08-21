import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/patternfly/patternfly.css';
import '@patternfly/patternfly/patternfly-addons.css';

import { Page } from '@patternfly/react-core';
import React from 'react';
import ReactDOM from 'react-dom/client';

export const App: React.FunctionComponent = () => {
  return <Page></Page>;
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
