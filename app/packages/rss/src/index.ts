import { IPlugin } from '@kobsio/core';

import icon from './assets/icon.png';
import RSSPage from './components/RSSPage';
import RSSPanel from './components/RSSPanel';
import { description } from './utils/utils';

const RSS: IPlugin = {
  description: description,
  icon: icon,
  page: RSSPage,
  panel: RSSPanel,
  type: 'rss',
};

export default RSS;
