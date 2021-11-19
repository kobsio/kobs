import React, { memo } from 'react';

import { IPluginPanelProps, PluginOptionsMissing } from '@kobsio/plugin-core';
import Aggregation from './Aggregation';
import { IPanelOptions } from '../../utils/interfaces';
import Logs from './Logs';

interface IPanelProps extends IPluginPanelProps {
  options?: IPanelOptions;
}

export const Panel: React.FunctionComponent<IPanelProps> = ({
  name,
  title,
  description,
  times,
  options,
}: IPanelProps) => {
  if (options && options.type === 'logs' && options.queries && times) {
    return <Logs name={name} title={title} description={description} queries={options.queries} times={times} />;
  }

  if (
    options &&
    options.type === 'aggregation' &&
    options.aggregation &&
    options.aggregation.chart &&
    options.aggregation.query &&
    times
  ) {
    return (
      <Aggregation
        name={name}
        title={title}
        description={description}
        options={{ ...options.aggregation, times: times }}
      />
    );
  }

  return (
    <PluginOptionsMissing
      title={title}
      message="Options for klogs panel are missing or invalid"
      details="The panel doesn't contain the required options to render get the klogs data or the provided options are invalid."
      documentation="https://kobs.io/plugins/klogs"
    />
  );
};

export default memo(Panel, (prevProps, nextProps) => {
  if (JSON.stringify(prevProps) === JSON.stringify(nextProps)) {
    return true;
  }

  return false;
});
