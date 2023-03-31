import { IPlugin } from '@kobsio/core';

import icon from './assets/icon.png';
import KialiPage from './components/KialiPage';
import KialiPanel from './components/KialiPanel';
import { description } from './utils/utils';

const Kiali: IPlugin = {
  description: description,
  icon: icon,
  page: KialiPage,
  panel: KialiPanel,
  type: 'kiali',
};

export default Kiali;
