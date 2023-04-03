import { IPlugin } from '@kobsio/core';

import icon from './assets/icon.png';
import MongoDBPage from './components/MongoDBPage';
import MongoDBPanel from './components/MongoDBPanel';
import { description } from './utils/utils';

const MongoDB: IPlugin = {
  description: description,
  icon: icon,
  page: MongoDBPage,
  panel: MongoDBPanel,
  type: 'mongodb',
};

export default MongoDB;
