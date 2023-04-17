import { IPlugin } from '@kobsio/core';

import icon from './assets/icon.png';
import HarborPage from './components/HarborPage';
import HarborPanel from './components/HarborPanel';
import { description, example } from './utils/utils';

const Harbor: IPlugin = {
  description: description,
  example: example,
  icon: icon,
  page: HarborPage,
  panel: HarborPanel,
  type: 'harbor',
};

export default Harbor;
