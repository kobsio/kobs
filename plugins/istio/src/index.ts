import { IPluginComponents } from '@kobsio/plugin-core';

import './assets/istio.css';

import icon from './assets/icon.png';

import Page from './components/page/Page';
import Panel from './components/panel/Panel';

const istioPlugin: IPluginComponents = {
  istio: {
    icon: icon,
    page: Page,
    panel: Panel,
  },
};

export default istioPlugin;
