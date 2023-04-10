import { IPlugin } from '@kobsio/core';

import icon from './assets/icon.png';
import KLogsPage from './components/KLogsPage';
import KLogsPanel from './components/KLogsPanel';
import { description } from './utils/utils';

const plugin: IPlugin = {
  description: description,
  icon: icon,
  page: KLogsPage,
  panel: KLogsPanel,
  type: 'klogs',
};

export default plugin;
