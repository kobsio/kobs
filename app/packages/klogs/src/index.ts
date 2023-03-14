import { IPlugin } from '@kobsio/core';

import icon from './assets/icon.png';
import LogsPage from './components/page/LogsPage';
import Panel from './components/panel/Panel';

const plugin: IPlugin = {
  description: 'Fast, scalable and reliable logging using Fluent Bit and ClickHouse.',
  icon: icon,
  page: LogsPage,
  panel: Panel,
  type: 'klogs',
};

export default plugin;
