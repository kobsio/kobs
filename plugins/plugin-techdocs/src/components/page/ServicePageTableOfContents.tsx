import { Card, CardBody, TextContent } from '@patternfly/react-core';
import React from 'react';
import ReactMarkdown from 'react-markdown';

import { IIndex } from '../../utils/interfaces';
import { IPluginInstance } from '@kobsio/shared';
import { renderLink } from '../../utils/renderers';

interface IServicePageTableOfContentsProps {
  instance: IPluginInstance;
  index: IIndex;
  path: string;
  toc: string;
}

const ServicePageTableOfContents: React.FunctionComponent<IServicePageTableOfContentsProps> = ({
  instance,
  index,
  path,
  toc,
}: IServicePageTableOfContentsProps) => {
  return (
    <Card style={{ width: '100%' }} isCompact={true}>
      <CardBody className="kobsio-hide-scrollbar" style={{ overflow: 'auto' }}>
        <TextContent>
          <ReactMarkdown
            components={{
              a: ({ href, ...props }): React.ReactElement => renderLink(instance, index.key, path, { href, ...props }),
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
