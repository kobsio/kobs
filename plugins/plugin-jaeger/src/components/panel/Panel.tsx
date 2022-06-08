import React from 'react';

import { IPluginPanelProps, PluginPanelError } from '@kobsio/shared';
import { IPanelOptions } from '../../utils/interfaces';
import TracesWrapper from './TracesWrapper';

interface IJaegerPluginPanelProps extends IPluginPanelProps {
  options?: IPanelOptions;
}

const Panel: React.FunctionComponent<IJaegerPluginPanelProps> = ({
  title,
  description,
  options,
  instance,
  times,
  setDetails,
}: IJaegerPluginPanelProps) => {
  if (options && options.queries && Array.isArray(options.queries) && options.queries.length > 0 && times) {
    return (
      <TracesWrapper
        instance={instance}
        title={title}
        description={description}
        setDetails={setDetails}
        showChart={options.showChart || false}
        queries={options.queries}
        times={times}
      />
    );
  }

  return (
    <PluginPanelError
      title={title}
      description={description}
      message="Options for Jaeger panel are missing or invalid"
      details="The panel doesn't contain the required options to get data traces from Jaeger."
      documentation="https://kobs.io/main/plugins/jaeger"
    />
  );
};

export default Panel;
