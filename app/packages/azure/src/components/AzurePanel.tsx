import { IPluginPanelProps, PluginPanelError } from '@kobsio/core';
import { FunctionComponent } from 'react';

import { CostManagement } from './CostManagement';
import { Metrics } from './Metrics';

import { example } from '../utils/utils';

interface IOptions {
  aggregationType: string;
  interval?: string;
  metric: string;
  provider: string;
  resourceGroup?: string;
  service?: string;
}

const AzurePanel: FunctionComponent<IPluginPanelProps<IOptions>> = ({
  title,
  description,
  options,
  instance,
  times,
  setTimes,
}) => {
  if (options && options.service === 'Cost Management') {
    return (
      <CostManagement
        title={title}
        description={description}
        instance={instance}
        resourceGroup={options.resourceGroup ?? ''}
        times={times}
      />
    );
  }

  if (
    options &&
    options.service === 'Metrics' &&
    options.resourceGroup &&
    options.provider &&
    options.metric &&
    options.aggregationType
  ) {
    return (
      <Metrics
        title={title}
        description={description}
        instance={instance}
        provider={options.provider}
        resourceGroup={options.resourceGroup}
        metric={options.metric}
        aggregationType={options.aggregationType}
        interval={options.interval ?? 'auto'}
        times={times}
        setTimes={setTimes}
      />
    );
  }

  return (
    <PluginPanelError
      title={title}
      description={description}
      message="Invalid options for Azure plugin"
      details="One of the required options is missing."
      example={example}
      documentation="https://kobs.io/main/plugins/azure"
    />
  );
};

export default AzurePanel;
