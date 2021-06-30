import { Card, CardBody, CardHeader, CardHeaderMain, Tooltip } from '@patternfly/react-core';
import React from 'react';

interface IPluginCardProps {
  title: string;
  description?: string;
  transparent?: boolean;
  children: React.ReactElement;
  actions?: React.ReactElement;
}

// The PluginCard component can be used as a wrapper component for the panel content of a plugin, to provide the same
// panel style for all plugins. The component requires the panel title and a child component. It also taks an optional
// description and some actions. For the actions the CardActions should be used by the plugin.
export const PluginCard: React.FunctionComponent<IPluginCardProps> = ({
  title,
  description,
  transparent,
  children,
  actions,
}: IPluginCardProps) => {
  return (
    <Card
      isCompact={true}
      style={
        transparent
          ? { backgroundColor: '#f0f0f0', boxShadow: 'none', height: '100%', width: '100%' }
          : { height: '100%', width: '100%' }
      }
    >
      <CardHeader>
        <CardHeaderMain>
          {description ? (
            <Tooltip content={<div>{description}</div>}>
              <span className="pf-u-font-weight-bold">{title}</span>
            </Tooltip>
          ) : (
            <span className="pf-u-font-weight-bold">{title}</span>
          )}
        </CardHeaderMain>
        {actions || null}
      </CardHeader>
      <CardBody style={{ overflow: 'scroll' }}>{children}</CardBody>
    </Card>
  );
};
