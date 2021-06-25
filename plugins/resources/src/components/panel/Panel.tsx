import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import React from 'react';

import { IPluginPanelProps, PluginOptionsMissing } from '@kobsio/plugin-core';
import { IPanelOptions } from '../../utils/utils';
import PanelList from './PanelList';
import icon from '../../assets/icon.png';

interface IPanelProps extends IPluginPanelProps {
  options?: IPanelOptions[];
}

export const Panel: React.FunctionComponent<IPanelProps> = ({ name, title, options, showDetails }: IPanelProps) => {
  if (!options) {
    return (
      <PluginOptionsMissing
        title="Options for Resources panel are missing"
        description=""
        documentation=""
        icon={icon}
      />
    );
  }

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
