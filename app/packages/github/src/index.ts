import { IPlugin } from '@kobsio/core';

import icon from './assets/icon.png';
import GithubPage from './components/GithubPage';
import GithubPanel from './components/GithubPanel';
import { description, example } from './utils/utils';

const Github: IPlugin = {
  description: description,
  example: example,
  icon: icon,
  page: GithubPage,
  panel: GithubPanel,
  type: 'github',
};

export default Github;
