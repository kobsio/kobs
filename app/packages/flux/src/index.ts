import { IPlugin } from '@kobsio/core';

import icon from './assets/icon.png';
import FluxPage from './components/FluxPage';
import FluxPanel from './components/FluxPanel';
import { description } from './utils/utils';

const Flux: IPlugin = {
  description: description,
  icon: icon,
  page: FluxPage,
  panel: FluxPanel,
  type: 'flux',
};

export default Flux;
