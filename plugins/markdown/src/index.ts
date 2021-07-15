import { IPluginComponents } from '@kobsio/plugin-core';

import icon from './assets/icon.png';

import Panel from './components/panel/Panel';

const markdownPlugin: IPluginComponents = {
  markdown: {
    icon: icon,
    panel: Panel,
  },
};

export default markdownPlugin;
