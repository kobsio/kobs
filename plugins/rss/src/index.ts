import { IPluginComponents } from '@kobsio/plugin-core';

import icon from './assets/icon.png';

import Panel from './components/panel/Panel';

const rssPlugin: IPluginComponents = {
  rss: {
    icon: icon,
    panel: Panel,
  },
};

export default rssPlugin;
