import { IPlugin } from '@kobsio/core';

import icon from './assets/icon.png';
import PrometheusPage from './components/PrometheusPage';
import PrometheusPanel from './components/PrometheusPanel';
import { description, example } from './utils/utils';

const Prometheus: IPlugin = {
  description: description,
  example: example,
  icon: icon,
  page: PrometheusPage,
  panel: PrometheusPanel,
  type: 'prometheus',
};

export default Prometheus;
