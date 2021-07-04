import React from 'react';
import ReactDOM from 'react-dom';

// Import plugins. Here we import all plugins, which we want to add to the current kobs app. By default this are all
// first party plugins from the /plugins folder.
import { App } from '@kobsio/plugin-core';
import resourcesPlugin from '@kobsio/plugin-resources';
import teamsPlugin from '@kobsio/plugin-teams';
import applicationsPlugin from '@kobsio/plugin-applications';
import dashboardsPlugin from '@kobsio/plugin-dashboards';
import prometheusPlugin from '@kobsio/plugin-prometheus';
import elasticsearchPlugin from '@kobsio/plugin-elasticsearch';

ReactDOM.render(
  <React.StrictMode>
    <App plugins={{
      ...resourcesPlugin,
      ...teamsPlugin,
      ...applicationsPlugin,
      ...dashboardsPlugin,
      ...prometheusPlugin,
      ...elasticsearchPlugin,
    }} />
  </React.StrictMode>,
  document.getElementById('root')
);
