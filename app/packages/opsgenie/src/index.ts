import { IPlugin } from '@kobsio/core';

import icon from './assets/icon.png';
import OpsgeniePage from './components/OpsgeniePage';
import OpsgeniePanel from './components/OpsgeniePanel';
import { description, example } from './utils/utils';

const Opsgenie: IPlugin = {
  description: description,
  example: example,
  icon: icon,
  page: OpsgeniePage,
  panel: OpsgeniePanel,
  type: 'opsgenie',
};

export default Opsgenie;
