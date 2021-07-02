import React, { memo } from 'react';
import { Card } from '@patternfly/react-core';

import { IPluginPanelProps, PluginCard, PluginOptionsMissing } from '@kobsio/plugin-core';
import { IPanelOptions } from '../../utils/interfaces';
import PanelList from './PanelList';

interface IPanelProps extends IPluginPanelProps {
  options?: IPanelOptions[];
}

// Panel implements the panel component for the resources plugin. The options property must be in the format of the
// IPanelOptions interface. Since the options are not validated on the API side, we have to validate the data, before
// we render the plugin.
export const Panel: React.FunctionComponent<IPanelProps> = ({
  defaults,
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

  // We replace the cluster and namespace in the provided options, when they were not set by the user. For that we are
  // using the cluster/namespace of the parent team/application where the panel is used.
  const opts: IPanelOptions[] = options.map((option) => {
    return {
      clusters: option.clusters || [defaults.cluster],
      namespaces: option.namespaces || [defaults.namespace],
      resources: option.resources,
      selector: option.selector,
    };
  });

  // When a title is provided we can be sure that the component is used within a dashboard. When no title is provided
  // the component is used in the resources page and we do not wrap it in the PluginCard component.
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

export default memo(Panel, (prevProps, nextProps) => {
  if (JSON.stringify(prevProps) === JSON.stringify(nextProps)) {
    return true;
  }

  return false;
});
