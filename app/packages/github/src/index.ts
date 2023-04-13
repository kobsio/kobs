import { IPlugin } from '@kobsio/core';

import icon from './assets/icon.png';
import GithubPage from './components/GithubPage';
import GithubPanel from './components/GithubPanel';
import { description } from './utils/utils';

const Github: IPlugin = {
  description: description,
  icon: icon,
  page: GithubPage,
  panel: GithubPanel,
  type: 'github',
};

export default Github;
