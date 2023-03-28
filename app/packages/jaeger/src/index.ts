import { IPlugin } from '@kobsio/core';

import icon from './assets/icon.png';
import JaegerPage from './components/JaegerPage';
import JaegerPanel from './components/JaegerPanel';
import { description } from './utils/utils';

const Jaeger: IPlugin = {
  description: description,
  icon: icon,
  page: JaegerPage,
  panel: JaegerPanel,
  type: 'jaeger',
};

export default Jaeger;
