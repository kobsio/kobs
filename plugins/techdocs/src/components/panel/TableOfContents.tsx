import { TextContent, TextList, TextListItem } from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import React from 'react';

import { IPage } from '../../utils/interfaces';

const getTitle = (page: IPage): string => {
  const titles = Object.keys(page);

  if (titles.length === 1) {
    return titles[0];
  }

  return '';
};

const renderPage = (key: string, name: string, service: string, page: IPage): React.ReactNode => {
  const title = getTitle(page);

  if (Array.isArray(page[title])) {
    return (
      <TextListItem key={key}>
        {title}
        <TextList>
          {(page[title] as IPage[]).map((p, index) => renderPage(`${key}-${index}`, name, service, p))}
        </TextList>
      </TextListItem>
    );
  }

  return (
    <TextListItem key={key}>
      <Link to={`/${name}/${service}/${page[title]}`}>{title}</Link>
    </TextListItem>
  );
};

interface ITableOfContentsProps {
  name: string;
  service: string;
  toc: IPage[];
}

const TableOfContents: React.FunctionComponent<ITableOfContentsProps> = ({
  name,
  service,
  toc,
}: ITableOfContentsProps) => {
  return (
    <TextContent>
      <TextList>{toc.map((page, index) => renderPage(`${index}`, name, service, page))}</TextList>
    </TextContent>
  );
};

export default TableOfContents;
