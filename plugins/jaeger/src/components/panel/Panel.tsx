import React, { memo } from 'react';

import { IPluginPanelProps, PluginOptionsMissing } from '@kobsio/plugin-core';
import { IPanelOptions } from '../../utils/interfaces';
import Traces from './Traces';

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
  if (!options || !options.service || !times) {
    return (
      <PluginOptionsMissing
        title={title}
        message="Options for Jaeger panel are missing or invalid"
        details="The panel doesn't contain the required options to render get the Jaeger data or the provided options are invalid."
        documentation="https://kobs.io/plugins/jaeger.html"
      />
    );
  }

  return (
    <Traces
      name={name}
      title={title}
      description={description}
      showDetails={showDetails}
      showChart={options.showChart || false}
      limit={options.limit || '20'}
      maxDuration={options.maxDuration || ''}
      minDuration={options.minDuration || ''}
      operation={options.operation || ''}
      service={options.service}
      tags={options.tags || ''}
      times={times}
    />
  );
};

export default memo(Panel, (prevProps, nextProps) => {
  if (JSON.stringify(prevProps) === JSON.stringify(nextProps)) {
    return true;
  }

  return false;
});
