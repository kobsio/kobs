import { Button, EmptyState, EmptyStateBody, EmptyStateIcon, Title } from '@patternfly/react-core';
import React from 'react';

interface INotDefinedProps {
  title: string;
  description: string;
  documentation: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>;
}

// NotDefined is the component, which is displayed when a component of an application isn't defined. It contains a
// title, description, icon and a link to the corresponding documentation.
const NotDefined: React.FunctionComponent<INotDefinedProps> = ({
  title,
  description,
  icon,
  documentation,
}: INotDefinedProps) => {
  return (
    <EmptyState>
      <EmptyStateIcon icon={icon} />
      <Title headingLevel="h4" size="lg">
        {title}
      </Title>
      <EmptyStateBody>{description}</EmptyStateBody>
      <Button variant="primary" component="a" target="_blank" href={documentation}>
        Documentation
      </Button>
    </EmptyState>
  );
};

export default NotDefined;
