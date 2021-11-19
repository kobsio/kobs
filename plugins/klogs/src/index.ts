import { IPluginComponents } from '@kobsio/plugin-core';

import './assets/klogs.css';

import icon from './assets/icon.png';

import Page from './components/page/Page';
import Panel from './components/panel/Panel';

const klogsPlugin: IPluginComponents = {
  klogs: {
    icon: icon,
    page: Page,
    panel: Panel,
  },
};

export default klogsPlugin;
