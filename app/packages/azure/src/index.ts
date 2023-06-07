import { IPlugin } from '@kobsio/core';

import icon from './assets/icon.png';
import AzurePage from './components/AzurePage';
import AzurePanel from './components/AzurePanel';
import { description, example } from './utils/utils';

const Azure: IPlugin = {
  description: description,
  example: example,
  icon: icon,
  page: AzurePage,
  panel: AzurePanel,
  type: 'azure',
};

export default Azure;
