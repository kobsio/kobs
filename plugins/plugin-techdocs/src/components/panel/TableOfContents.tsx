import { TextContent, TextList, TextListItem } from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import React from 'react';

import { IPluginInstance, pluginBasePath } from '@kobsio/shared';
import { IPage } from '../../utils/interfaces';

const getTitle = (page: IPage): string => {
  const titles = Object.keys(page);

  if (titles.length === 1) {
    return titles[0];
  }

  return '';
};

const renderPage = (key: string, instance: IPluginInstance, service: string, page: IPage): React.ReactNode => {
  const title = getTitle(page);

  if (Array.isArray(page[title])) {
    return (
      <TextListItem key={key}>
        {title}
        <TextList>
          {(page[title] as IPage[]).map((p, index) => renderPage(`${key}-${index}`, instance, service, p))}
        </TextList>
      </TextListItem>
    );
  }

  return (
    <TextListItem key={key}>
      <Link to={`${pluginBasePath(instance)}/${service}/${encodeURIComponent(page[title] as string)}`}>{title}</Link>
    </TextListItem>
  );
};

interface ITableOfContentsProps {
  instance: IPluginInstance;
  service: string;
  toc: IPage[];
}

const TableOfContents: React.FunctionComponent<ITableOfContentsProps> = ({
  instance,
  service,
  toc,
}: ITableOfContentsProps) => {
  return (
    <TextContent>
      <TextList>{toc.map((page, index) => renderPage(`${index}`, instance, service, page))}</TextList>
    </TextContent>
  );
};

export default TableOfContents;
