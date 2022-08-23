import { Alert, AlertActionLink, AlertVariant } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Serie } from '@nivo/line';

import { IPanelOptions, ISeries } from '../../utils/interfaces';
import { IPluginInstance, ITimes, PluginPanel } from '@kobsio/shared';
import Actions from './Actions';
import Chart from './Chart';
import ChartLegend from './ChartLegend';
import { convertMetrics } from '../../utils/helpers';

interface IChartWrapperProps {
  instance: IPluginInstance;
  title: string;
  description?: string;
  times: ITimes;
  options: IPanelOptions;
}

// The ChartWrapper components handles the loading of the data for the line and area chart. It also contains a state for
// the selected metrics, which is used together with the table legend, so that a user can hide all metrics except one in
// the chart.
export const ChartWrapper: React.FunctionComponent<IChartWrapperProps> = ({
  instance,
  title,
  description,
  times,
  options,
}: IChartWrapperProps) => {
  // selectedSeries contains a list of all selected metrics. For the first time the component is rendered the value will
  // be an empty array. After that it contains one series or all series.
  const [selectedSeries, setSelectedSeries] = useState<Serie[]>([]);

  // Here we are fetching the required data, but instead of the metrics from the API we have to transform the result
  // into a series so that we can use it in nivo charts. The result also contains a list with all the labels for all
  // series.
  const { isError, isFetching, error, data, refetch } = useQuery<ISeries, Error>(
    ['prometheus/metrics', instance, options.queries, times],
    async () => {
      try {
        if (!options.queries || !Array.isArray(options.queries) || options.queries.length === 0) {
          throw new Error('Queries are missing');
        }

        const response = await fetch(`/api/plugins/prometheus/metrics`, {
          body: JSON.stringify({
            queries: options.queries,
            resolution: '',
            timeEnd: times.timeEnd,
            timeStart: times.timeStart,
          }),
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-kobs-plugin': instance.name,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-kobs-satellite': instance.satellite,
          },
          method: 'post',
        });
        const json = await response.json();

        if (response.status >= 200 && response.status < 300) {
          if (json && json.metrics) {
            return convertMetrics(json.metrics, json.startTime, json.endTime, json.min, json.max);
          } else {
            return { endTime: times.timeEnd, labels: {}, max: 0, min: 0, series: [], startTime: times.timeStart };
          }
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
    { keepPreviousData: true },
  );

  // select is used to select a single metric, which should be shown in the rendered chart. If the currently selected
  // metric is clicked again, the filter will be removed and all metrics will be shown in the chart.
  const select = (color: string, metric: Serie): void => {
    if (selectedSeries.length === 1 && selectedSeries[0].label === metric.label) {
      setSelectedSeries(data && data.series ? data.series : []);
    } else {
      setSelectedSeries([{ ...metric, color: color }]);
    }
  };

  return (
    <PluginPanel
      title={title}
      description={description}
      actions={<Actions instance={instance} isFetching={isFetching} times={times} queries={options.queries} />}
    >
      {isError ? (
        <Alert
          variant={AlertVariant.danger}
          isInline={true}
          title="Could not get metrics"
          actionLinks={
            <React.Fragment>
              <AlertActionLink onClick={(): Promise<QueryObserverResult<ISeries, Error>> => refetch()}>
                Retry
              </AlertActionLink>
            </React.Fragment>
          }
        >
          <p>{error?.message}</p>
        </Alert>
      ) : data ? (
        <React.Fragment>
          <div
            style={{
              height:
                options.legend === 'table'
                  ? 'calc(100% - 80px)'
                  : options.legend === 'table-large'
                  ? 'calc(100% - 140px)'
                  : '100%',
            }}
          >
            <Chart
              startTime={data.startTime}
              endTime={data.endTime}
              min={data.min}
              max={data.max}
              options={options}
              labels={data.labels}
              series={selectedSeries.length > 0 ? selectedSeries : data.series}
            />
          </div>
          {options.legend === 'table' ? (
            <div className="pf-u-mt-md kobsio-hide-scrollbar" style={{ height: '60px', overflow: 'auto' }}>
              <ChartLegend series={data.series} unit={options.unit || ''} selected={selectedSeries} select={select} />
            </div>
          ) : options.legend === 'table-large' ? (
            <div className="pf-u-mt-md kobsio-hide-scrollbar" style={{ height: '120px', overflow: 'auto' }}>
              <ChartLegend series={data.series} unit={options.unit || ''} selected={selectedSeries} select={select} />
            </div>
          ) : null}
        </React.Fragment>
      ) : null}
    </PluginPanel>
  );
};

export default ChartWrapper;