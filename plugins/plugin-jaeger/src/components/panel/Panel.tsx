import React from 'react';

import { IPluginPanelProps, PluginPanelError } from '@kobsio/shared';
import { IPanelOptions } from '../../utils/interfaces';
import MonitorOperations from './MonitorOperations';
import MonitorServiceCalls from './MonitorServiceCalls';
import MonitorServiceErrors from './MonitorServiceErrors';
import MonitorServiceLatency from './MonitorServiceLatency';
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

  if (options && options.metrics && options.metrics.type && options.metrics.service && times) {
    const spanKinds =
      options.metrics.spanKinds && Array.isArray(options.metrics.spanKinds) && options.metrics.spanKinds.length > 0
        ? options.metrics.spanKinds
        : ['unspecified', 'internal', 'server', 'client', 'producer', 'consumer'];

    if (options.metrics.type === 'servicelatency') {
      return (
        <MonitorServiceLatency
          instance={instance}
          title={title}
          description={description}
          service={options.metrics.service}
          spanKinds={spanKinds}
          times={times}
        />
      );
    }

    if (options.metrics.type === 'serviceerrors') {
      return (
        <MonitorServiceErrors
          instance={instance}
          title={title}
          description={description}
          service={options.metrics.service}
          spanKinds={spanKinds}
          times={times}
        />
      );
    }

    if (options.metrics.type === 'servicecalls') {
      return (
        <MonitorServiceCalls
          instance={instance}
          title={title}
          description={description}
          service={options.metrics.service}
          spanKinds={spanKinds}
          times={times}
        />
      );
    }

    if (options.metrics.type === 'operations') {
      return (
        <MonitorOperations
          instance={instance}
          title={title}
          description={description}
          service={options.metrics.service}
          spanKinds={spanKinds}
          times={times}
          setDetails={setDetails}
        />
      );
    }
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
