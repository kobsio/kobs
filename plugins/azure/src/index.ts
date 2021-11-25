import { IPluginComponents } from '@kobsio/plugin-core';

import './assets/azure.css';

import icon from './assets/icon.png';

import Page from './components/page/Page';
import Panel from './components/panel/Panel';

const azurePlugin: IPluginComponents = {
  azure: {
    icon: icon,
    page: Page,
    panel: Panel,
  },
};

export default azurePlugin;
