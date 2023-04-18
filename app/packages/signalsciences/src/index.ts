import { IPlugin } from '@kobsio/core';

import icon from './assets/icon.png';
import SignalSciencesPage from './components/SignalSciencesPage';
import SignalSciencesPanel from './components/SignalSciencesPanel';
import { description, example } from './utils/utils';

const SignalSciences: IPlugin = {
  description: description,
  example: example,
  icon: icon,
  page: SignalSciencesPage,
  panel: SignalSciencesPanel,
  type: 'signalsciences',
};

export default SignalSciences;
