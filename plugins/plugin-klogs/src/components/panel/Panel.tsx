import React from 'react';

import { IPluginPanelProps, PluginPanelError } from '@kobsio/shared';
import Aggregation from './Aggregation';
import { IPanelOptions } from '../../utils/interfaces';
import Logs from './Logs';

interface IKlogsPluginPanelProps extends IPluginPanelProps {
  options?: IPanelOptions;
}

const Panel: React.FunctionComponent<IKlogsPluginPanelProps> = ({
  title,
  description,
  options,
  instance,
  times,
  setDetails,
}: IKlogsPluginPanelProps) => {
  if (options && options.type === 'logs' && options.queries && times) {
    return <Logs instance={instance} title={title} description={description} queries={options.queries} times={times} />;
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
        instance={instance}
        title={title}
        description={description}
        options={{ ...options.aggregation, times: times }}
      />
    );
  }

  return (
    <PluginPanelError
      title={title}
      description={description}
      message="Options for klogs panel are missing or invalid"
      details="The panel doesn't contain the required options to get data from klogs."
      documentation="https://kobs.io/main/plugins/klogs"
    />
  );
};

export default Panel;
