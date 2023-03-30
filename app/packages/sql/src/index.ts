import { IPlugin } from '@kobsio/core';

import icon from './assets/icon.png';
import Panel from './components/Panel';
import SQLPage from './components/SQLPage';

const plugin: IPlugin = {
  description: 'Access the data of an relational database management system.',
  icon: icon,
  page: SQLPage,
  panel: Panel,
  type: 'sql',
};

export default plugin;
