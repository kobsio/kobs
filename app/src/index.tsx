import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';

// Import plugins. Here we import all plugins, which we want to add to the current kobs app. By default this are all
// first party plugins from the /plugins folder.
import { App } from '@kobsio/plugin-core';
import resourcesPlugin from '@kobsio/plugin-resources';
import teamsPlugin from '@kobsio/plugin-teams';
import applicationsPlugin from '@kobsio/plugin-applications';
import dashboardsPlugin from '@kobsio/plugin-dashboards';
import prometheusPlugin from '@kobsio/plugin-prometheus';
import elasticsearchPlugin from '@kobsio/plugin-elasticsearch';
import jaegerPlugin from '@kobsio/plugin-jaeger';
import kialiPlugin from '@kobsio/plugin-kiali';
import fluxPlugin from '@kobsio/plugin-flux';
import opsgeniePlugin from '@kobsio/plugin-opsgenie';
import markdownPlugin from '@kobsio/plugin-markdown';
import rssPlugin from '@kobsio/plugin-rss';
import clickhousePlugin from '@kobsio/plugin-clickhouse';
import sqlPlugin from '@kobsio/plugin-sql';

ReactDOM.render(
  <React.StrictMode>
    <App plugins={{
      ...resourcesPlugin,
      ...teamsPlugin,
      ...applicationsPlugin,
      ...dashboardsPlugin,
      ...prometheusPlugin,
      ...elasticsearchPlugin,
      ...jaegerPlugin,
      ...kialiPlugin,
      ...fluxPlugin,
      ...opsgeniePlugin,
      ...markdownPlugin,
      ...rssPlugin,
      ...clickhousePlugin,
      ...sqlPlugin,
    }} />
  </React.StrictMode>,
  document.getElementById('root')
);
