import { Brand, Button, EmptyState, EmptyStateBody, EmptyStateIcon, Title } from '@patternfly/react-core';
import React from 'react';

interface IPluginOptionsMissingProps {
  title: string;
  description: string;
  documentation: string;
  icon: string;
}

// PluginOptionsMissing is the component, which is displayed when the user defines a plugin in a Team or an Application,
// but the options for the plugin are missing or invalid It contains a title, description, icon and a link to the
// corresponding documentation.
export const PluginOptionsMissing: React.FunctionComponent<IPluginOptionsMissingProps> = ({
  title,
  description,
  documentation,
  icon,
}: IPluginOptionsMissingProps) => {
  const PluginIcon: React.FunctionComponent = () => {
    return <Brand src={icon} alt="Logo" width="128px" />;
  };

  return (
    <EmptyState>
      <EmptyStateIcon variant="container" component={PluginIcon} />
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
