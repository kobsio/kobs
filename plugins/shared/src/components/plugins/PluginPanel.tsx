import { Card, CardBody, CardHeader, CardTitle, Tooltip } from '@patternfly/react-core';
import React from 'react';

interface IPluginPanelProps {
  title: string;
  description?: string;
  children: React.ReactElement | null;
  actions?: React.ReactElement;
  footer?: React.ReactElement;
}

export const PluginPanel: React.FunctionComponent<IPluginPanelProps> = ({
  title,
  description,
  children,
  actions,
  footer,
}: IPluginPanelProps) => {
  if (!title) {
    return children;
  }

  return (
    <Card isCompact={true} style={{ height: '100%', width: '100%' }}>
      <CardHeader>
        {actions || null}
        <CardTitle>
          {description ? (
            <Tooltip content={<div>{description}</div>}>
              <span>{title}</span>
            </Tooltip>
          ) : (
            <span>{title}</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardBody className="kobsio-hide-scrollbar" style={{ overflow: 'auto' }}>
        {children}
      </CardBody>
      {footer || null}
    </Card>
  );
};
