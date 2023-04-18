import { IPlugin } from '@kobsio/core';

import icon from './assets/icon.png';
import HelmPage from './components/HelmPage';
import HelmPanel from './components/HelmPanel';
import { description, example } from './utils/utils';

const Helm: IPlugin = {
  description: description,
  example: example,
  icon: icon,
  page: HelmPage,
  panel: HelmPanel,
  type: 'helm',
};

export default Helm;
