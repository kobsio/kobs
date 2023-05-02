import { IPlugin } from '@kobsio/core';

import icon from './assets/icon.png';
import GrafanaPage from './components/GrafanaPage';
import GrafanaPanel from './components/GrafanaPanel';
import { description, example } from './utils/utils';

const Grafana: IPlugin = {
  description: description,
  example: example,
  icon: icon,
  page: GrafanaPage,
  panel: GrafanaPanel,
  type: 'grafana',
};

export default Grafana;
