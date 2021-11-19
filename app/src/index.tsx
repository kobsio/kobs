import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';

// Import plugins. Here we import all plugins, which we want to add to the current kobs app. By default this are all
// first party plugins from the /plugins folder.
import { App } from '@kobsio/plugin-core';
import applicationsPlugin from '@kobsio/plugin-applications';
import dashboardsPlugin from '@kobsio/plugin-dashboards';
import elasticsearchPlugin from '@kobsio/plugin-elasticsearch';
import fluxPlugin from '@kobsio/plugin-flux';
import grafanaPlugin from '@kobsio/plugin-grafana';
import harborPlugin from '@kobsio/plugin-harbor';
import istioPlugin from '@kobsio/plugin-istio';
import jaegerPlugin from '@kobsio/plugin-jaeger';
import kialiPlugin from '@kobsio/plugin-kiali';
import klogsPlugin from '@kobsio/plugin-klogs';
import markdownPlugin from '@kobsio/plugin-markdown';
import opsgeniePlugin from '@kobsio/plugin-opsgenie';
import prometheusPlugin from '@kobsio/plugin-prometheus';
import resourcesPlugin from '@kobsio/plugin-resources';
import rssPlugin from '@kobsio/plugin-rss';
import sonarqubePlugin from '@kobsio/plugin-sonarqube';
import sqlPlugin from '@kobsio/plugin-sql';
import teamsPlugin from '@kobsio/plugin-teams';
import usersPlugin from '@kobsio/plugin-users';

ReactDOM.render(
  <React.StrictMode>
    <App plugins={{
      ...applicationsPlugin,
      ...dashboardsPlugin,
      ...elasticsearchPlugin,
      ...fluxPlugin,
      ...grafanaPlugin,
      ...harborPlugin,
      ...istioPlugin,
      ...jaegerPlugin,
      ...kialiPlugin,
      ...klogsPlugin,
      ...markdownPlugin,
      ...opsgeniePlugin,
      ...prometheusPlugin,
      ...resourcesPlugin,
      ...rssPlugin,
      ...sonarqubePlugin,
      ...sqlPlugin,
      ...teamsPlugin,
      ...usersPlugin,
    }} />
  </React.StrictMode>,
  document.getElementById('root')
);
