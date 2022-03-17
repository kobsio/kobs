import { IPluginComponents } from '@kobsio/plugin-core';

import icon from './assets/icon.png';

import Page from './components/page/Page';
import Panel from './components/panel/Panel';

import TeamsItem from './components/page/TeamsItem';

const teamsPlugin: IPluginComponents = {
  teams: {
    icon: icon,
    page: Page,
    panel: Panel,
  },
};

export default teamsPlugin;

export { TeamsItem };
