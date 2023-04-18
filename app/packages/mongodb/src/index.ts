import { IPlugin } from '@kobsio/core';

import icon from './assets/icon.png';
import MongoDBPage from './components/MongoDBPage';
import MongoDBPanel from './components/MongoDBPanel';
import { description, example } from './utils/utils';

const MongoDB: IPlugin = {
  description: description,
  example: example,
  icon: icon,
  page: MongoDBPage,
  panel: MongoDBPanel,
  type: 'mongodb',
};

export default MongoDB;
