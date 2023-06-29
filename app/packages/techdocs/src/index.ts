import { IPlugin } from '@kobsio/core';

import icon from './assets/icon.png';
import { Markdown } from './components/Markdown';
import TechDocsPage from './components/TechDocsPage';
import TechDocsPanel from './components/TechDocsPanel';
import { description, example } from './utils/utils';

const TechDocs: IPlugin = {
  description: description,
  example: example,
  icon: icon,
  page: TechDocsPage,
  panel: TechDocsPanel,
  type: 'techdocs',
};

export default TechDocs;

export const TechDocsMarkdown = Markdown;
