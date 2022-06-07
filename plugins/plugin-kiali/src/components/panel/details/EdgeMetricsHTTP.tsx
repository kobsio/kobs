import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';

import { IChart, IMetricsMap, INodeWrapper, ISerie } from '../../../utils/interfaces';
import { IPluginInstance, ITimes } from '@kobsio/shared';
import { convertMetrics, getSteps } from '../../../utils/helpers';
import Chart from './Chart';

interface IEdgeMetricsHTTPProps {
  instance: IPluginInstance;
  times: ITimes;
  sourceNode: INodeWrapper;
  targetNode: INodeWrapper;
}

const EdgeMetricsHTTP: React.FunctionComponent<IEdgeMetricsHTTPProps> = ({
  instance,
  times,
  sourceNode,
  targetNode,
}: IEdgeMetricsHTTPProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IChart[], Error>(
    ['kiali/metrics/edge/http', instance, times, sourceNode, targetNode],
    async () => {
      try {
        if (targetNode.data?.namespace === 'unknown') {
          return [];
        }

        let nodeType = 'workloads';
        let nodeName = targetNode.data?.workload;
        let byLabels = '&byLabels[]=destination_service_name';
        let reporter = 'destination';

        if (targetNode.data?.nodeType === 'service') {
          nodeType = 'services';
          nodeName = targetNode.data?.service;
          byLabels = '&byLabels[]=source_workload';
          reporter = 'source';
        }

        if ((sourceNode.data, nodeType === 'unknown')) {
          reporter = 'destination';
        }

        let filterKey = 'source_workload';
        let filterValue = sourceNode.data?.workload;
        if (sourceNode.data?.workload === 'service') {
          filterKey = 'destination_service_name';
          filterValue = sourceNode.data?.service;
        }

        const response = await fetch(
          `/api/plugins/kiali/metrics?url=${encodeURIComponent(
            `/kiali/api/namespaces/${targetNode.data?.namespace}/${nodeType}/${nodeName}/metrics?queryTime=${
              times.timeEnd
            }&duration=${times.timeEnd - times.timeStart}${getSteps(
              times.timeStart,
              times.timeEnd,
            )}&quantiles[]=0.5&quantiles[]=0.95&quantiles[]=0.99&filters[]=request_count&filters[]=request_duration_millis&filters[]=request_error_count${byLabels}&direction=inbound&reporter=${reporter}&requestProtocol=http`,
          )}`,
          {
            headers: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'x-kobs-plugin': instance.name,
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'x-kobs-satellite': instance.satellite,
            },
            method: 'get',
          },
        );
        const json = await response.json();

        if (response.status >= 200 && response.status < 300) {
          if (!json) {
            return [];
          }

          const metrics: IMetricsMap = json;
          const seriesCount: ISerie[] = [];
          let seriesTime: ISerie[] = [];

          if (metrics.request_count) {
            seriesCount.push(
              ...convertMetrics(metrics.request_count.filter((metric) => metric.labels[filterKey] === filterValue)),
            );
          }

          if (metrics.request_error_count) {
            seriesCount.push(
              ...convertMetrics(
                metrics.request_error_count.filter((metric) => metric.labels[filterKey] === filterValue),
              ),
            );
          }

          if (metrics.request_duration_millis) {
            seriesTime = convertMetrics(
              metrics.request_duration_millis.filter((metric) => metric.labels[filterKey] === filterValue),
            );
          }

          return [
            {
              series: seriesCount,
              title: 'HTTP Requests per Second',
              unit: 'req/s',
            },
            {
              series: seriesTime,
              title: 'HTTP Requests Response Time',
              unit: 'ms',
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

export default EdgeMetricsHTTP;
