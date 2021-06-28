import { Card, CardBody, CardHeader, CardTitle } from '@patternfly/react-core';
import React from 'react';

interface IPanelItemProps {
  title: string;
  description?: string;
}

const PanelItem: React.FunctionComponent<IPanelItemProps> = ({ title, description }: IPanelItemProps) => {
  return (
    <Card isCompact={true} isHoverable={true}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardBody>{description || ''}</CardBody>
    </Card>
  );
};

export default PanelItem;
