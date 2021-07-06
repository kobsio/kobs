import { IPluginComponents } from '@kobsio/plugin-core';

import './assets/jaeger.css';

import icon from './assets/icon.png';

import Page from './components/page/Page';
import Panel from './components/panel/Panel';

const jaegerPlugin: IPluginComponents = {
  jaeger: {
    icon: icon,
    page: Page,
    panel: Panel,
  },
};

export default jaegerPlugin;
