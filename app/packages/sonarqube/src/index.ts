import { IPlugin } from '@kobsio/core';

import icon from './assets/icon.png';
import SonarQubePage from './components/SonarQubePage';
import SonarQubePanel from './components/SonarQubePanel';
import { description } from './utils/utils';

const SonarQube: IPlugin = {
  description: description,
  icon: icon,
  page: SonarQubePage,
  panel: SonarQubePanel,
  type: 'sonarqube',
};

export default SonarQube;
