import { Card, CardBody, CardHeader, CardHeaderMain, Tooltip } from '@patternfly/react-core';
import React from 'react';

interface IPluginCardProps {
  title: string;
  description?: string;
  children: React.ReactElement;
  actions?: React.ReactElement;
}

// The PluginCard component can be used as a wrapper component for the panel content of a plugin, to provide the same
// panel style for all plugins. The component requires the panel title and a child component. It also taks an optional
// description and some actions. For the actions the CardActions should be used by the plugin.
export const PluginCard: React.FunctionComponent<IPluginCardProps> = ({
  title,
  description,
  children,
  actions,
}: IPluginCardProps) => {
  return (
    <Card isCompact={true} style={{ height: '100%', width: '100%' }}>
      <CardHeader>
        <CardHeaderMain>
          {description ? (
            <Tooltip content={<div>{description}</div>}>
              <span>{title}</span>
            </Tooltip>
          ) : (
            title
          )}
        </CardHeaderMain>
        {actions || null}
      </CardHeader>
      <CardBody style={{ overflow: 'scroll' }}>{children}</CardBody>
    </Card>
  );
};
