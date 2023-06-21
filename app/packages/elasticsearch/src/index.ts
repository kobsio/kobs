import { IPlugin } from '@kobsio/core';

import icon from './assets/icon.png';
import ElasticsearchPage from './components/ElasticsearchPage';
import ElasticsearchPanel from './components/ElasticsearchPanel';
import { description, example } from './utils/utils';

const Elasticsearch: IPlugin = {
  description: description,
  example: example,
  icon: icon,
  page: ElasticsearchPage,
  panel: ElasticsearchPanel,
  type: 'elasticsearch',
};

export default Elasticsearch;
