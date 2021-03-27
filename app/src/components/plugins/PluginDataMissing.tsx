import { Button, EmptyState, EmptyStateBody, EmptyStateIcon, Title } from '@patternfly/react-core';
import React from 'react';

interface IPluginDataMissingProps {
  title: string;
  description: string;
  documentation: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>;
}

// PluginDataMissing is the component, which is displayed when the user defines a plugin in an Application CR, but the
// property for the type of the plugin is missing. It contains a title, description, icon and a link to the
// corresponding documentation.
const PluginDataMissing: React.FunctionComponent<IPluginDataMissingProps> = ({
  title,
  description,
  icon,
  documentation,
}: IPluginDataMissingProps) => {
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

export default PluginDataMissing;
