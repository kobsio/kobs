import { Alert, AlertVariant, TextContent } from '@patternfly/react-core';
import React from 'react';
import ReactMarkdown from 'react-markdown';

interface IMarkdownProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any;
}

const Markdown: React.FunctionComponent<IMarkdownProps> = ({ options }: IMarkdownProps) => {
  if (options.text) {
    return (
      <TextContent>
        <ReactMarkdown linkTarget="_blank">{options.text}</ReactMarkdown>
      </TextContent>
    );
  }

  return (
    <Alert isInline={true} variant={AlertVariant.danger} title="Invalid plugin configuration">
      The provided options for the <b>markdown</b> plugin are invalid.
    </Alert>
  );
};

export default Markdown;
