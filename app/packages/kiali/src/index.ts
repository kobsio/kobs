import { IPlugin } from '@kobsio/core';

import icon from './assets/icon.png';
import KialiPage from './components/KialiPage';
import KialiPanel from './components/KialiPanel';
import { description, example } from './utils/utils';

const Kiali: IPlugin = {
  description: description,
  example: example,
  icon: icon,
  page: KialiPage,
  panel: KialiPanel,
  type: 'kiali',
};

export default Kiali;
