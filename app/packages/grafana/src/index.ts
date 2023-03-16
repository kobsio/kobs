import { IPlugin } from '@kobsio/core';

import icon from './assets/icon.png';
import GrafanaPage from './components/GrafanaPage';
import GrafanaPanel from './components/GrafanaPanel';
import { description } from './utils/utils';

const Grafana: IPlugin = {
  description: description,
  icon: icon,
  page: GrafanaPage,
  panel: GrafanaPanel,
  type: 'grafana',
};

export default Grafana;
