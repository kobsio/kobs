import { Alert, AlertVariant, Spinner } from '@patternfly/react-core';
import React from 'react';

import { IPluginInstance, ITimes, PluginPanel } from '@kobsio/shared';
import { operationMetricsToData, useGetOperationMetrics } from '../../utils/helpers';
import MonitorOperationsTable from './MonitorOperationsTable';

interface IMonitorOperationsProps {
  title: string;
  description?: string;
  instance: IPluginInstance;
  service: string;
  times: ITimes;
  setDetails?: (details: React.ReactNode) => void;
}

const MonitorOperations: React.FunctionComponent<IMonitorOperationsProps> = ({
  title,
  description,
  instance,
  times,
  service,
  setDetails,
}: IMonitorOperationsProps) => {
  const metrics = useGetOperationMetrics(instance, service, times);

  if (
    metrics[0].isLoading ||
    metrics[1].isLoading ||
    metrics[2].isLoading ||
    metrics[3].isLoading ||
    metrics[4].isLoading
  ) {
    return (
      <PluginPanel title={title} description={description}>
        <div className="pf-u-text-align-center">
          <Spinner />
        </div>
      </PluginPanel>
    );
  }

  if (metrics[0].isError || metrics[1].isError || metrics[2].isError || metrics[3].isError || metrics[4].isError) {
    return (
      <PluginPanel title={title} description={description}>
        <Alert isInline={true} variant={AlertVariant.danger} title="Could not get metrics">
          {metrics[0].error?.message && <p>{metrics[0].error?.message}</p>}
          {metrics[1].error?.message && <p>{metrics[1].error?.message}</p>}
          {metrics[2].error?.message && <p>{metrics[2].error?.message}</p>}
          {metrics[3].error?.message && <p>{metrics[3].error?.message}</p>}
          {metrics[4].error?.message && <p>{metrics[4].error?.message}</p>}
        </Alert>
      </PluginPanel>
    );
  }

  return (
    <MonitorOperationsTable
      title={title}
      description={description}
      data={operationMetricsToData([
        { metrics: metrics[0].data, name: 'P50' },
        { metrics: metrics[1].data, name: 'P75' },
        { metrics: metrics[2].data, name: 'P95' },
        { metrics: metrics[3].data, name: 'Errors' },
        { metrics: metrics[4].data, name: 'Calls' },
      ])}
      instance={instance}
      service={service}
      times={times}
      setDetails={setDetails}
    />
  );
};

export default MonitorOperations;
