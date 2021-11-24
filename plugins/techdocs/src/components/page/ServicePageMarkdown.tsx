import { Card, CardBody, TextContent } from '@patternfly/react-core';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { renderCode, renderHeading, renderLink, renderPre, renderTable } from '../../utils/renderers';
import { IIndex } from '../../utils/interfaces';
import { imageTransformer } from '../../utils/helpers';

interface IServicePageMarkdownProps {
  name: string;
  index: IIndex;
  path: string;
  markdown: string;
  setDetails?: (details: React.ReactNode) => void;
}

const ServicePageMarkdown: React.FunctionComponent<IServicePageMarkdownProps> = ({
  name,
  index,
  path,
  markdown,
  setDetails,
}: IServicePageMarkdownProps) => {
  return (
    <Card isCompact={true}>
      <CardBody>
        <TextContent>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            transformImageUri={(uri): string => imageTransformer(uri, name, index.key, path)}
            components={{
              a: ({ href, ...props }): React.ReactElement => renderLink(name, index.key, path, { href, ...props }),
              code: ({ inline, ...props }): React.ReactElement => renderCode({ inline, ...props }, setDetails),
              h1: renderHeading,
              h2: renderHeading,
              h3: renderHeading,
              h4: renderHeading,
              h5: renderHeading,
              h6: renderHeading,
              pre: renderPre,
              table: renderTable,
            }}
          >
            {markdown}
          </ReactMarkdown>
        </TextContent>
      </CardBody>
    </Card>
  );
};

export default ServicePageMarkdown;
