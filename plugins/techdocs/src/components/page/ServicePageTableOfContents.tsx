import { Card, CardBody, TextContent } from '@patternfly/react-core';
import React from 'react';
import ReactMarkdown from 'react-markdown';

import { IIndex } from '../../utils/interfaces';
import { renderLink } from '../../utils/renderers';

interface IServicePageTableOfContentsProps {
  name: string;
  index: IIndex;
  path: string;
  toc: string;
}

const ServicePageTableOfContents: React.FunctionComponent<IServicePageTableOfContentsProps> = ({
  name,
  index,
  path,
  toc,
}: IServicePageTableOfContentsProps) => {
  return (
    <Card style={{ width: '100%' }} isCompact={true}>
      <CardBody style={{ overflow: 'scroll' }}>
        <TextContent>
          <ReactMarkdown
            components={{
              a: ({ href, ...props }): React.ReactElement => renderLink(name, index.key, path, { href, ...props }),
            }}
          >
            {toc}
          </ReactMarkdown>
        </TextContent>
      </CardBody>
    </Card>
  );
};

export default ServicePageTableOfContents;
