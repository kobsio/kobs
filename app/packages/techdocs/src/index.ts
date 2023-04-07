import { IPlugin } from '@kobsio/core';

import icon from './assets/icon.png';
import TechDocsPage from './components/TechDocsPage';
import TechDocsPanel from './components/TechDocsPanel';
import { description } from './utils/utils';

const TechDocs: IPlugin = {
  description: description,
  icon: icon,
  page: TechDocsPage,
  panel: TechDocsPanel,
  type: 'techdocs',
};

export default TechDocs;
