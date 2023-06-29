import { IPlugin } from '@kobsio/core';

import icon from './assets/icon.png';
import RunbooksPage from './components/RunbooksPage';
import RunbooksPanel from './components/RunbooksPanel';
import { description, example } from './utils/utils';

const Runbooks: IPlugin = {
  description: description,
  example: example,
  icon: icon,
  page: RunbooksPage,
  panel: RunbooksPanel,
  type: 'runbooks',
};

export default Runbooks;
