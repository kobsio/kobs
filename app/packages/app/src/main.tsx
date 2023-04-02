import { App } from '@kobsio/core';
import Flux from '@kobsio/flux';
import Grafana from '@kobsio/grafana';
import Harbor from '@kobsio/harbor';
import Helm from '@kobsio/helm';
import Jaeger from '@kobsio/jaeger';
import Kiali from '@kobsio/kiali';
import MongoDB from '@kobsio/mongodb';
import Opsgenie from '@kobsio/opsgenie';
import Prometheus from '@kobsio/prometheus';
import RSS from '@kobsio/rss';
import SignalSciences from '@kobsio/signalsciences';
import SonarQube from '@kobsio/sonarqube';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import '@kobsio/core/dist/style.css';
import '@kobsio/jaeger/dist/style.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App
      plugins={[
        Flux,
        Grafana,
        Harbor,
        Helm,
        Jaeger,
        Kiali,
        MongoDB,
        Opsgenie,
        Prometheus,
        RSS,
        SignalSciences,
        SonarQube,
      ]}
    />
  </StrictMode>,
);
