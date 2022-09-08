import { Alert, AlertVariant, Spinner } from '@patternfly/react-core';
import React from 'react';

import { IPluginInstance, ITimes, PluginPanel } from '@kobsio/shared';
import { serviceMetricsToChartData, useGetServiceLatency } from '../../utils/helpers';
import MonitorChart from './MonitorChart';

interface IMonitorServiceLatencyProps {
  title: string;
  description?: string;
  instance: IPluginInstance;
  service: string;
  spanKinds: string[];
  times: ITimes;
}

const MonitorServiceLatency: React.FunctionComponent<IMonitorServiceLatencyProps> = ({
  title,
  description,
  instance,
  service,
  spanKinds,
  times,
}: IMonitorServiceLatencyProps) => {
  const latencies = useGetServiceLatency(instance, service, spanKinds, times);

  return (
    <PluginPanel title={title} description={description}>
      {latencies[0].isLoading || latencies[1].isLoading || latencies[2].isLoading ? (
        <div className="pf-u-text-align-center">
          <Spinner />
        </div>
      ) : latencies[0].isError || latencies[1].isError || latencies[2].isError ? (
        <Alert isInline={true} variant={AlertVariant.danger} title="Could not get metrics">
          {latencies[0].error?.message && <p>{latencies[0].error?.message}</p>}
          {latencies[1].error?.message && <p>{latencies[1].error?.message}</p>}
          {latencies[2].error?.message && <p>{latencies[2].error?.message}</p>}
        </Alert>
      ) : (
        <MonitorChart
          data={serviceMetricsToChartData([
            { metrics: latencies[0].data, name: 'P50' },
            { metrics: latencies[1].data, name: 'P75' },
            { metrics: latencies[2].data, name: 'P95' },
          ])}
          unit="ms"
          times={times}
        />
      )}
    </PluginPanel>
  );
};

export default MonitorServiceLatency;
