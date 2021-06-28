import { IPluginComponents } from '@kobsio/plugin-core';

import './assets/dashboards.css';

import icon from './assets/icon.png';

import { IReference } from './utils/interfaces';
import Page from './components/page/Page';
import Panel from './components/panel/Panel';

const dashboardsPlugin: IPluginComponents = {
  dashboards: {
    icon: icon,
    page: Page,
    panel: Panel,
  },
};

export default dashboardsPlugin;

export * from './components/dashboards/Dashboards';
export type IDashboardReference = IReference;
