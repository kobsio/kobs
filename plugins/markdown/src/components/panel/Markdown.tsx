import React from 'react';
import ReactMarkdown from 'react-markdown';
import { TextContent } from '@patternfly/react-core';

interface IMarkdownProps {
  text: string;
}

const Markdown: React.FunctionComponent<IMarkdownProps> = ({ text }: IMarkdownProps) => {
  return (
    <TextContent>
      <ReactMarkdown linkTarget="_blank">{text}</ReactMarkdown>
    </TextContent>
  );
};

export default Markdown;
