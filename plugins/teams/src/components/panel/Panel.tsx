import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import React from 'react';

import { IPluginPanelProps } from '@kobsio/plugin-core';

export const Panel: React.FunctionComponent<IPluginPanelProps> = ({ title }: IPluginPanelProps) => {
  return (
    <Card isCompact={true}>
      <CardTitle>{title}</CardTitle>
      <CardBody>Show all teams</CardBody>
    </Card>
  );
};

export default Panel;
