import { IPlugin } from '@kobsio/core';

import icon from './assets/icon.png';
import JaegerPage from './components/JaegerPage';
import JaegerPanel from './components/JaegerPanel';
import { description, example } from './utils/utils';

const Jaeger: IPlugin = {
  description: description,
  example: example,
  icon: icon,
  page: JaegerPage,
  panel: JaegerPanel,
  type: 'jaeger',
};

export default Jaeger;
