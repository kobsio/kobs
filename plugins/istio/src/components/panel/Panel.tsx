import React, { memo } from 'react';

import { IPluginPanelProps, PluginOptionsMissing } from '@kobsio/plugin-core';
import { IPanelOptions } from '../../utils/interfaces';

interface IPanelProps extends IPluginPanelProps {
  options?: IPanelOptions;
}

export const Panel: React.FunctionComponent<IPanelProps> = ({
  name,
  title,
  description,
  times,
  options,
  showDetails,
}: IPanelProps) => {
  if (!options || !times) {
    return (
      <PluginOptionsMissing
        title={title}
        message="Options for Istio panel are missing or invalid"
        details="The panel doesn't contain the required options to render get the Istio data or the provided options are invalid."
        documentation="https://kobs.io/plugins/istio"
      />
    );
  }

  return null;
};

export default memo(Panel, (prevProps, nextProps) => {
  if (JSON.stringify(prevProps) === JSON.stringify(nextProps)) {
    return true;
  }

  return false;
});
