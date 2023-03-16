import { App } from '@kobsio/core';
import Flux from '@kobsio/flux';
import Harbor from '@kobsio/harbor';
import Helm from '@kobsio/helm';
import Prometheus from '@kobsio/prometheus';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import '@kobsio/core/dist/style.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App plugins={[Flux, Harbor, Helm, Prometheus]} />
  </StrictMode>,
);
