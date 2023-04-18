import { IPlugin } from '@kobsio/core';

import icon from './assets/icon.png';
import KLogsPage from './components/KLogsPage';
import KLogsPanel from './components/KLogsPanel';
import { description, example } from './utils/utils';

const plugin: IPlugin = {
  description: description,
  example: example,
  icon: icon,
  page: KLogsPage,
  panel: KLogsPanel,
  type: 'klogs',
};

export default plugin;
