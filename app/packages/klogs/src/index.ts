import { IPlugin } from '@kobsio/core';

import icon from './assets/icon.png';
import Entrypoint from './components/page/Routes';
import Panel from './components/panel/Panel';

const plugin: IPlugin = {
  description: 'Fast, scalable and reliable logging using Fluent Bit and ClickHouse.',
  icon: icon,
  page: Entrypoint,
  panel: Panel,
  type: 'klogs',
};

export default plugin;
