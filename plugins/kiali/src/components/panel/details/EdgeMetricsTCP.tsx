import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';

import { IChart, IMetricsMap, INodeWrapper, ISerie } from '../../../utils/interfaces';
import { convertMetrics, getSteps } from '../../../utils/helpers';
import Chart from './Chart';
import { IPluginTimes } from '@kobsio/plugin-core';

interface IEdgeMetricsTCPProps {
  name: string;
  times: IPluginTimes;
  sourceNode: INodeWrapper;
  targetNode: INodeWrapper;
}

const EdgeMetricsTCP: React.FunctionComponent<IEdgeMetricsTCPProps> = ({
  name,
  times,
  sourceNode,
  targetNode,
}: IEdgeMetricsTCPProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IChart[], Error>(
    ['kiali/metrics/edge/tcp', name, times, sourceNode, targetNode],
    async () => {
      try {
        if (targetNode.data?.namespace === 'unknown') {
          return [];
        }

        let nodeType = 'workloads';
        let nodeName = targetNode.data?.workload;
        let byLabels = '&byLabels[]=destination_service_name';
        let direction = 'inbound';

        if (targetNode.data?.nodeType === 'service') {
          nodeType = 'services';
          nodeName = targetNode.data?.service;
          byLabels = '&byLabels[]=source_workload';
        } else if (targetNode.data?.nodeType === 'serviceentry') {
          nodeType = 'workloads';
          nodeName = sourceNode.data?.workload;
          direction = 'outbound';
        }

        let filterKey = 'source_workload';
        let filterValue = sourceNode.data?.workload;
        if (sourceNode.data?.nodeType === 'service') {
          filterKey = 'destination_service_name';
          filterValue = sourceNode.data.service;
        } else if (targetNode.data?.nodeType === 'serviceentry') {
          filterKey = 'destination_service_name';
          filterValue =
            targetNode.data.isServiceEntry?.hosts && targetNode.data.isServiceEntry?.hosts.length > 0
              ? targetNode.data.isServiceEntry?.hosts[0]
              : '';
        }

        const response = await fetch(
          `/api/plugins/kiali/metrics/${name}?url=${encodeURIComponent(
            `/kiali/api/namespaces/${targetNode.data?.namespace}/${nodeType}/${nodeName}/metrics?queryTime=${
              times.timeEnd
            }&duration=${times.timeEnd - times.timeStart}${getSteps(
              times.timeStart,
              times.timeEnd,
            )}&quantiles[]=0.5&quantiles[]=0.95&quantiles[]=0.99&filters[]=tcp_sent&filters[]=tcp_received${byLabels}&direction=${direction}&reporter=source`,
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
          const series: ISerie[] = [];

          if (metrics.tcp_received) {
            series.push(
              ...convertMetrics(metrics.tcp_received.filter((metric) => metric.labels[filterKey] === filterValue)),
            );
          }

          if (metrics.tcp_sent) {
            series.push(
              ...convertMetrics(metrics.tcp_sent.filter((metric) => metric.labels[filterKey] === filterValue)),
            );
          }

          return [
            {
              series: series,
              title: 'TCP Traffic',
              unit: 'B/s',
            },
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

export default EdgeMetricsTCP;
