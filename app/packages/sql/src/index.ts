import { IPlugin } from '@kobsio/core';

import icon from './assets/icon.png';
import SQLPage from './components/SQLPage';
import SQLPanel from './components/SQLPanel';
import { description, example } from './utils/utils';

const plugin: IPlugin = {
  description: description,
  example: example,
  icon: icon,
  page: SQLPage,
  panel: SQLPanel,
  type: 'sql',
};

export default plugin;
