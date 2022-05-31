import { Alert, AlertActionLink, AlertVariant } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';
import { ResponsiveLineCanvas } from '@nivo/line';

import { COLOR_SCALE, IPluginInstance, ITimes, PluginPanel } from '@kobsio/shared';
import { IPanelOptions, ISeries } from '../../utils/interfaces';
import { convertMetrics, getMappingValue, roundNumber } from '../../utils/helpers';
import Actions from './Actions';

interface ISpakrlineProps {
  instance: IPluginInstance;
  title: string;
  description?: string;
  times: ITimes;
  options: IPanelOptions;
}

// The Spakrline component is used to render a sparkline chart. The chart is very simular to an area chart, but we do
// not show a legend and the chart is not interactive. Additionally we are show the last value above the chart. This
// value can be replaced with a mapping value, which must be specified by the user via the mappings parameter in the
// options.
export const Spakrline: React.FunctionComponent<ISpakrlineProps> = ({
  instance,
  title,
  description,
  times,
  options,
}: ISpakrlineProps) => {
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

  // Determine the label which should be shown above the chart. This is the last value in first metric of the returned
  // data or a value from the user specified mappings.
  let label = 'N/A';
  if (options.queries && Array.isArray(options.queries) && options.queries.length > 0 && options.queries[0].label) {
    if (data && data.labels && data.labels.hasOwnProperty('0-0')) {
      label = data.labels['0-0'];
    }
  } else if (data && data.series && data.series.length > 0) {
    if (options.mappings && Object.keys(options.mappings).length > 0) {
      label = getMappingValue(data.series[0].data[data.series[0].data.length - 1].y, options.mappings);
    } else {
      label =
        data.series[0].data[data.series[0].data.length - 1].y === null
          ? 'N/A'
          : `${roundNumber(data.series[0].data[data.series[0].data.length - 1].y as number)} ${
              options.unit ? options.unit : ''
            }`;
    }
  }

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
      ) : data && data.series ? (
        <React.Fragment>
          <div style={{ height: '100%', position: 'relative' }}>
            <div style={{ fontSize: '24px', position: 'absolute', textAlign: 'center', top: '31px', width: '100%' }}>
              {label}
            </div>
            <ResponsiveLineCanvas
              colors={COLOR_SCALE[0]}
              curve="monotoneX"
              data={data.series}
              enableArea={true}
              enableGridX={false}
              enableGridY={false}
              enablePoints={false}
              isInteractive={false}
              lineWidth={1}
              margin={{ bottom: 0, left: 0, right: 0, top: 0 }}
              xScale={{ max: new Date(data.endTime), min: new Date(data.startTime), type: 'time' }}
              yScale={{ stacked: false, type: 'linear' }}
            />
          </div>
        </React.Fragment>
      ) : null}
    </PluginPanel>
  );
};

export default Spakrline;
