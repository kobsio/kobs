import React, { memo } from 'react';

import { IPluginPanelProps, PluginOptionsMissing } from '@kobsio/plugin-core';
import ChartWrapper from './ChartWrapper';
import { IPanelOptions } from '../../utils/interfaces';
import Sparkline from './Sparkline';
import Table from './Table';

interface IPanelProps extends IPluginPanelProps {
  options?: IPanelOptions;
}

// The Panel component implements the panel component for the Prometheus plugin. When the options or the start/end time
// is missing we show an error. For all other cases we try to show the correct chart and handle the errors in the
// corresponding components.
export const Panel: React.FunctionComponent<IPanelProps> = ({
  name,
  title,
  description,
  times,
  options,
}: IPanelProps) => {
  if (!options || !times) {
    return (
      <PluginOptionsMissing
        title={title}
        message="Options for Prometheus panel are missing or invalid"
        details="The panel doesn't contain the required options to render the Prometheus chart or the provided options are invalid."
        documentation="https://kobs.io/plugins/prometheus"
      />
    );
  }

  if (options.type === 'sparkline') {
    return <Sparkline name={name} title={title} description={description} times={times} options={options} />;
  } else if (options.type === 'table') {
    return <Table name={name} title={title} description={description} times={times} options={options} />;
  } else {
    return <ChartWrapper name={name} title={title} description={description} times={times} options={options} />;
  }
};

export default memo(Panel, (prevProps, nextProps) => {
  if (JSON.stringify(prevProps) === JSON.stringify(nextProps)) {
    return true;
  }

  return false;
});
