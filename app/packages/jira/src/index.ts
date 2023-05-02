import { IPlugin } from '@kobsio/core';

import icon from './assets/icon.png';
import JiraPage from './components/JiraPage';
import JiraPanel from './components/JiraPanel';
import { description, example } from './utils/utils';

const Jira: IPlugin = {
  description: description,
  example: example,
  icon: icon,
  page: JiraPage,
  panel: JiraPanel,
  type: 'jira',
};

export default Jira;
