import { IPluginComponents } from '@kobsio/plugin-core';

import './assets/kiali.css';

import icon from './assets/icon.png';

import Page from './components/page/Page';
import Panel from './components/panel/Panel';

const kialiPlugin: IPluginComponents = {
  kiali: {
    icon: icon,
    page: Page,
    panel: Panel,
  },
};

export default kialiPlugin;
