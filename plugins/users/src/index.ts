import { IPluginComponents } from '@kobsio/plugin-core';

import icon from './assets/icon.png';

import Page from './components/page/Page';
import Panel from './components/panel/Panel';

const usersPlugin: IPluginComponents = {
  users: {
    icon: icon,
    page: Page,
    panel: Panel,
  },
};

export default usersPlugin;
