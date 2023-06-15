import { IPlugin } from '@kobsio/core';

import icon from './assets/icon.png';
import DatadogPage from './components/DatadogPage';
import DatadogPanel from './components/DatadogPanel';
import { description, example } from './utils/utils';

const Datadog: IPlugin = {
  description: description,
  example: example,
  icon: icon,
  page: DatadogPage,
  panel: DatadogPanel,
  type: 'datadog',
};

export default Datadog;
