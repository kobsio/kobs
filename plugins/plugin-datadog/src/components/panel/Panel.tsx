import React from 'react';

import { IPluginPanelProps, PluginPanelError } from '@kobsio/shared';
import { IPanelOptions } from '../../utils/interfaces';
import LogsWrapper from './LogsWrapper';

interface IDatadogPluginPanelProps extends IPluginPanelProps {
  options?: IPanelOptions;
}

const Panel: React.FunctionComponent<IDatadogPluginPanelProps> = ({
  title,
  description,
  options,
  instance,
  times,
}: IDatadogPluginPanelProps) => {
  if (options && options.type && options.type === 'logs' && options.queries && times) {
    return (
      <LogsWrapper
        title={title}
        description={description}
        instance={instance}
        queries={options.queries}
        times={times}
      />
    );
  }

  return (
    <PluginPanelError
      title={title}
      description={description}
      message="Options for Datadog panel are missing or invalid"
      details="The panel doesn't contain the required options to get data from Datadog."
      documentation="https://kobs.io/main/plugins/datadog"
    />
  );
};

export default Panel;
