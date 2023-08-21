import { IPlugin } from '@kobsio/core';

import icon from './assets/icon.png';
import VeleroPage from './components/VeleroPage';
import VeleroPanel from './components/VeleroPanel';
import { description, example } from './utils/utils';

const Velero: IPlugin = {
  description: description,
  example: example,
  icon: icon,
  page: VeleroPage,
  panel: VeleroPanel,
  type: 'velero',
};

export default Velero;
