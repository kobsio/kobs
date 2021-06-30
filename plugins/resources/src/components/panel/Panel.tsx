import { Card } from '@patternfly/react-core';
import React from 'react';

import { IPluginPanelProps, PluginCard, PluginOptionsMissing } from '@kobsio/plugin-core';
import { IPanelOptions } from '../../utils/utils';
import PanelList from './PanelList';

interface IPanelProps extends IPluginPanelProps {
  options?: IPanelOptions[];
}

export const Panel: React.FunctionComponent<IPanelProps> = ({
  defaults,
  name,
  title,
  description,
  options,
  showDetails,
}: IPanelProps) => {
  if (!options || !Array.isArray(options)) {
    return (
      <PluginOptionsMissing
        title={title}
        message="Options for Resources panel are missing or invalid"
        details="The panel doesn't contain the required options to get resources or the provided options are invalid."
        documentation=""
      />
    );
  }

  const opts: IPanelOptions[] = options.map((option) => {
    return {
      clusters: option.clusters || [defaults.cluster],
      namespaces: option.namespaces || [defaults.namespace],
      resources: option.resources,
      selector: option.selector,
    };
  });

  if (title) {
    return (
      <PluginCard title={title} description={description} transparent={true}>
        <PanelList resources={opts} showDetails={showDetails} />
      </PluginCard>
    );
  }

  return (
    <Card>
      <PanelList resources={opts} showDetails={showDetails} />
    </Card>
  );
};

export default Panel;
