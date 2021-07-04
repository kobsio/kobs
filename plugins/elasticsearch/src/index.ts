import { IPluginComponents } from '@kobsio/plugin-core';

import icon from './assets/icon.png';

import Page from './components/page/Page';
import Panel from './components/panel/Panel';

const elasticsearchPlugin: IPluginComponents = {
  elasticsearch: {
    icon: icon,
    page: Page,
    panel: Panel,
  },
};

export default elasticsearchPlugin;
