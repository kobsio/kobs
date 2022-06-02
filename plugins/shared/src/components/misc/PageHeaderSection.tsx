import { PageSection, PageSectionVariants, Text, TextContent } from '@patternfly/react-core';
import React from 'react';

interface IPageHeaderSectionProps {
  title?: string;
  description?: string;
  component?: React.ReactNode;
}

export const PageHeaderSection: React.FunctionComponent<IPageHeaderSectionProps> = ({
  title,
  description,
  component,
}: IPageHeaderSectionProps) => {
  return (
    <PageSection variant={PageSectionVariants.light}>
      {component ? (
        component
      ) : (
        <TextContent>
          {title && <Text component="h1">{title}</Text>}
          {description && <Text component="p">{description}</Text>}
        </TextContent>
      )}
    </PageSection>
  );
};
