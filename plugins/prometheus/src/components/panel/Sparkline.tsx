import { Alert, AlertActionLink, AlertVariant } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import { ResponsiveLineCanvas, Serie } from '@nivo/line';
import React from 'react';

import { IPluginTimes, PluginCard } from '@kobsio/plugin-core';
import { convertMetrics, getMappingValue } from '../../utils/helpers';
import Actions from './Actions';
import { COLOR_SCALE } from '../../utils/colors';
import { IPanelOptions } from '../../utils/interfaces';

interface ISpakrlineProps {
  name: string;
  title: string;
  description?: string;
  times: IPluginTimes;
  options: IPanelOptions;
}

// The Spakrline component is used to render a sparkline chart. The chart is very simular to an area chart, but we do
// not show a legend and the chart is not interactive. Additionally we are show the last value above the chart. This
// value can be replaced with a mapping value, which must be specified by the user via the mappings parameter in the
// options.
export const Spakrline: React.FunctionComponent<ISpakrlineProps> = ({
  name,
  title,
  description,
  times,
  options,
}: ISpakrlineProps) => {
  const { isError, isFetching, error, data, refetch } = useQuery<Serie[], Error>(
    ['prometheus/metrics', name, options.queries, times],
    async () => {
      try {
        if (!options.queries || !Array.isArray(options.queries) || options.queries.length === 0) {
          throw new Error('Queries are missing');
        }

        const response = await fetch(`/api/plugins/prometheus/metrics/${name}`, {
          body: JSON.stringify({
            queries: options.queries,
            resolution: '',
            timeEnd: times.timeEnd,
            timeStart: times.timeStart,
          }),
          method: 'post',
        });
        const json = await response.json();

        if (response.status >= 200 && response.status < 300) {
          return convertMetrics(json).series;
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
  let label = '';
  if (data && options.mappings && Object.keys(options.mappings).length > 0) {
    label = getMappingValue(data[0].data[data[0].data.length - 1].y, options.mappings);
  } else if (data) {
    label = `${data[0].data[data[0].data.length - 1].y} ${options.unit ? options.unit : ''}`;
  }

  return (
    <PluginCard
      title={title}
      description={description}
      actions={<Actions name={name} isFetching={isFetching} times={times} queries={options.queries} />}
    >
      {isError ? (
        <Alert
          variant={AlertVariant.danger}
          isInline={true}
          title="Could not get metrics"
          actionLinks={
            <React.Fragment>
              <AlertActionLink onClick={(): Promise<QueryObserverResult<Serie[], Error>> => refetch()}>
                Retry
              </AlertActionLink>
            </React.Fragment>
          }
        >
          <p>{error?.message}</p>
        </Alert>
      ) : data ? (
        <React.Fragment>
          <div style={{ height: '100%', position: 'relative' }}>
            <div style={{ fontSize: '24px', position: 'absolute', textAlign: 'center', top: '31px', width: '100%' }}>
              {label}
            </div>
            <ResponsiveLineCanvas
              colors={COLOR_SCALE[0]}
              curve="monotoneX"
              data={data}
              enableArea={true}
              enableGridX={false}
              enableGridY={false}
              enablePoints={false}
              isInteractive={false}
              lineWidth={1}
              margin={{ bottom: 0, left: 0, right: 0, top: 0 }}
              xScale={{ type: 'time' }}
              yScale={{ stacked: false, type: 'linear' }}
            />
          </div>
        </React.Fragment>
      ) : null}
    </PluginCard>
  );
};

export default Spakrline;
