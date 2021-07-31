import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';

import { IChart, IMetricsMap, ISerie } from '../../../utils/interfaces';
import { convertMetrics, getSteps } from '../../../utils/helpers';
import Chart from './Chart';
import { IPluginTimes } from '@kobsio/plugin-core';

const getTCPChart = (nodeType: string, direction: string, metrics: IMetricsMap): IChart => {
  const series: ISerie[] = [];
  let title = '';

  if (metrics.tcp_received) {
    series.push(...convertMetrics(metrics.tcp_received));
  }

  if (metrics.tcp_sent) {
    series.push(...convertMetrics(metrics.tcp_sent));
  }

  if (nodeType === 'services') {
    title = 'TCP Traffic';
  } else {
    if (direction === 'inbound') {
      title = 'TCP Inbound Traffic';
    } else if (direction === 'outbound') {
      title = 'TCP Outbound Traffic';
    }
  }

  return {
    series: series,
    title: title,
    unit: 'B/s',
  };
};

const getHTTPgRPCChart = (
  nodeType: string,
  direction: string,
  requestProtocol: string,
  metrics: IMetricsMap,
): IChart => {
  const series: ISerie[] = [];
  let title = '';

  if (metrics.request_count) {
    series.push(
      ...convertMetrics(
        metrics.request_count.filter((metric) => metric.labels['request_protocol'] === requestProtocol),
      ),
    );
  }

  if (metrics.request_error_count) {
    series.push(
      ...convertMetrics(
        metrics.request_error_count.filter((metric) => metric.labels['request_protocol'] === requestProtocol),
      ),
    );
  }

  if (nodeType === 'services') {
    title = `${requestProtocol === 'http' ? 'HTTP' : 'gRPC'} Requests per Second`;
  } else {
    if (direction === 'inbound') {
      title = `${requestProtocol === 'http' ? 'HTTP' : 'gRPC'} Inbound Requests per Second`;
    } else if (direction === 'outbound') {
      title = `${requestProtocol === 'http' ? 'HTTP' : 'gRPC'} Outbound Requests per Second`;
    }
  }

  return {
    series: series,
    title: title,
    unit: 'req/s',
  };
};

interface INodeMetricsProps {
  name: string;
  times: IPluginTimes;
  nodeNamespace: string;
  nodeType: string;
  nodeName: string;
  filters: string;
  byLabels: string;
  direction: string;
  reporter: string;
}

const NodeMetrics: React.FunctionComponent<INodeMetricsProps> = ({
  name,
  times,
  nodeNamespace,
  nodeType,
  nodeName,
  filters,
  byLabels,
  direction,
  reporter,
}: INodeMetricsProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IChart[], Error>(
    ['kiali/metrics/node', name, times, nodeNamespace, nodeType, nodeName, filters, byLabels, direction, reporter],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/kiali/metrics/${name}?url=${encodeURIComponent(
            `/kiali/api/namespaces/${nodeNamespace}/${nodeType}/${nodeName}/metrics?queryTime=${
              times.timeEnd
            }&duration=${times.timeEnd - times.timeStart}${getSteps(
              times.timeStart,
              times.timeEnd,
            )}${filters}${byLabels}&direction=${direction}&reporter=${reporter}`,
          )}`,
          {
            method: 'get',
          },
        );
        const json = await response.json();

        if (response.status >= 200 && response.status < 300) {
          if (!json) {
            return [];
          }

          const metrics: IMetricsMap = json;

          return [
            getTCPChart(nodeType, direction, metrics),
            getHTTPgRPCChart(nodeType, direction, 'http', metrics),
            getHTTPgRPCChart(nodeType, direction, 'grpc', metrics),
          ];
        } else {
          if (json.error) {
            throw new Error(json.error);
          } else {
            throw new Error('An unknown error occured');
          }
        }
      } catch (err) {
        throw err;
      }
    },
  );

  if (isLoading) {
    return (
      <div className="pf-u-text-align-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert
        variant={AlertVariant.danger}
        title="Could not get metrics"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IChart[], Error>> => refetch()}>
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error?.message}</p>
      </Alert>
    );
  }

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div>
      {data.map(
        (chart, index) =>
          chart.series.length > 0 && (
            <div key={index}>
              <Chart times={times} chart={chart} />
              <p>&nbsp;</p>
            </div>
          ),
      )}
    </div>
  );
};

export default NodeMetrics;
