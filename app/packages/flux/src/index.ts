import { IPlugin } from '@kobsio/core';

import icon from './assets/icon.png';
import FluxPage from './components/FluxPage';
import FluxPanel from './components/FluxPanel';
import { description, example } from './utils/utils';

const Flux: IPlugin = {
  description: description,
  example: example,
  icon: icon,
  page: FluxPage,
  panel: FluxPanel,
  type: 'flux',
};

export default Flux;
