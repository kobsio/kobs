import { PageSection, PageSectionVariants, Text, TextContent } from '@patternfly/react-core';
import React from 'react';

interface IPageHeaderSectionProps {
  title: string;
  description: string;
}

export const PageHeaderSection: React.FunctionComponent<IPageHeaderSectionProps> = ({
  title,
  description,
}: IPageHeaderSectionProps) => {
  return (
    <PageSection variant={PageSectionVariants.light}>
      <TextContent>
        <Text component="h1">{title}</Text>
        <Text component="p">{description}</Text>
      </TextContent>
    </PageSection>
  );
};
