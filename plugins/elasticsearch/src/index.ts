import { IPluginComponents } from '@kobsio/plugin-core';

import './assets/elasticsearch.css';

import icon from './assets/icon.png';

import Page from './components/page/Page';
import Panel from './components/panel/Panel';
import Preview from './components/preview/Preview';

const elasticsearchPlugin: IPluginComponents = {
  elasticsearch: {
    icon: icon,
    page: Page,
    panel: Panel,
    preview: Preview,
  },
};

export default elasticsearchPlugin;
