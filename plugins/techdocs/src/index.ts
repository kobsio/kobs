import { IPluginComponents } from '@kobsio/plugin-core';

import './assets/techdocs.css';

import icon from './assets/icon.png';

import Page from './components/page/Page';
import Panel from './components/panel/Panel';

const techdocsPlugin: IPluginComponents = {
  techdocs: {
    icon: icon,
    page: Page,
    panel: Panel,
  },
};

export default techdocsPlugin;
