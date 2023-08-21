import Azure from '@kobsio/azure';
import { App } from '@kobsio/core';
import Datadog from '@kobsio/datadog';
import Elasticsearch from '@kobsio/elasticsearch';
import Flux from '@kobsio/flux';
import Github from '@kobsio/github';
import Grafana from '@kobsio/grafana';
import Harbor from '@kobsio/harbor';
import Helm from '@kobsio/helm';
import Jaeger from '@kobsio/jaeger';
import Jira from '@kobsio/jira';
import Kiali from '@kobsio/kiali';
import Klogs from '@kobsio/klogs';
import MongoDB from '@kobsio/mongodb';
import Opsgenie from '@kobsio/opsgenie';
import Prometheus from '@kobsio/prometheus';
import RSS from '@kobsio/rss';
import Runbooks from '@kobsio/runbooks';
import SignalSciences from '@kobsio/signalsciences';
import SonarQube from '@kobsio/sonarqube';
import SQL from '@kobsio/sql';
import TechDocs from '@kobsio/techdocs';
import Velero from '@kobsio/velero';
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
        Azure,
        Datadog,
        Elasticsearch,
        Flux,
        Github,
        Grafana,
        Harbor,
        Helm,
        Jaeger,
        Jira,
        Kiali,
        Klogs,
        MongoDB,
        Opsgenie,
        Prometheus,
        RSS,
        Runbooks,
        SignalSciences,
        SonarQube,
        SQL,
        TechDocs,
        Velero,
      ]}
    />
  </StrictMode>,
);
