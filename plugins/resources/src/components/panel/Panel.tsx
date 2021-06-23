import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import React from 'react';

import { IPanelOptions } from '../../utils/utils';
import { IPluginPanelProps } from '@kobsio/plugin-core';
import PanelList from './PanelList';

interface IPanelProps extends IPluginPanelProps {
  options: IPanelOptions[];
}

export const Panel: React.FunctionComponent<IPanelProps> = ({ name, title, options, showDetails }: IPanelProps) => {
  if (title) {
    return (
      <Card isCompact={true}>
        <CardTitle>{title}</CardTitle>
        <CardBody>
          <PanelList resources={options} showDetails={showDetails} />
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <PanelList resources={options} showDetails={showDetails} />
    </Card>
  );
};

export default Panel;
