import React, { memo } from 'react';
import { Card } from '@patternfly/react-core';

import { IPluginPanelProps, PluginCard, PluginOptionsMissing } from '@kobsio/plugin-core';
import { IPanelOptions } from '../../utils/interfaces';
import PanelActions from './PanelActions';
import PanelList from './PanelList';

interface IPanelProps extends IPluginPanelProps {
  options?: IPanelOptions[];
}

// Panel implements the panel component for the resources plugin. The options property must be in the format of the
// IPanelOptions interface. Since the options are not validated on the API side, we have to validate the data, before
// we render the plugin.
export const Panel: React.FunctionComponent<IPanelProps> = ({
  title,
  description,
  options,
  times,
  setDetails,
}: IPanelProps) => {
  if (options && Array.isArray(options) && options.length > 0 && times) {
    // When a title is provided we can be sure that the component is used within a dashboard. When no title is provided
    // the component is used in the resources page and we do not wrap it in the PluginCard component.
    if (title) {
      return (
        <PluginCard
          title={title}
          description={description}
          transparent={true}
          actions={<PanelActions options={options} />}
        >
          <PanelList resources={options} times={times} setDetails={setDetails} />
        </PluginCard>
      );
    }

    return (
      <Card>
        <PanelList resources={options} times={times} setDetails={setDetails} />
      </Card>
    );
  }

  return (
    <PluginOptionsMissing
      title={title}
      message="Options for Resources panel are missing or invalid"
      details="The panel doesn't contain the required options to get resources or the provided options are invalid."
      documentation="https://kobs.io/plugins/resources"
    />
  );
};

export default memo(Panel, (prevProps, nextProps) => {
  if (JSON.stringify(prevProps) === JSON.stringify(nextProps)) {
    return true;
  }

  return false;
});
