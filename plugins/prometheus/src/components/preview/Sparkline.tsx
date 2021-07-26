import { Alert, AlertVariant, Spinner } from '@patternfly/react-core';
import { ResponsiveLineCanvas, Serie } from '@nivo/line';
import React from 'react';
import { useQuery } from 'react-query';

import { convertMetrics, getMappingValue } from '../../utils/helpers';
import { COLOR_SCALE } from '../../utils/colors';
import { IPanelOptions } from '../../utils/interfaces';
import { IPluginTimes } from '@kobsio/plugin-core';

interface ISpakrlineProps {
  name: string;
  times: IPluginTimes;
  title: string;
  options: IPanelOptions;
}

export const Spakrline: React.FunctionComponent<ISpakrlineProps> = ({
  name,
  times,
  title,
  options,
}: ISpakrlineProps) => {
  const { isError, isLoading, error, data } = useQuery<Serie[], Error>(
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
          if (json) {
            return convertMetrics(json).series;
          } else {
            return [];
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
  if (data && data.length > 0) {
    if (options.mappings && Object.keys(options.mappings).length > 0) {
      label = getMappingValue(data[0].data[data[0].data.length - 1].y, options.mappings);
    } else {
      label =
        data[0].data[data[0].data.length - 1].y === null
          ? 'N/A'
          : `${data[0].data[data[0].data.length - 1].y} ${options.unit ? options.unit : ''}`;
    }
  }

  return (
    <div>
      {isLoading ? (
        <div className="pf-u-text-align-center">
          <Spinner />
        </div>
      ) : isError ? (
        <Alert variant={AlertVariant.danger} isInline={true} title={error?.message} />
      ) : data ? (
        <div>
          <div className="pf-u-font-size-lg pf-u-text-nowrap pf-u-text-truncate">{label}</div>
          <div className="pf-u-font-size-sm pf-u-color-400 pf-u-text-nowrap pf-u-text-truncate">{title}</div>
          <div style={{ height: '75px' }}>
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
        </div>
      ) : null}
    </div>
  );
};

export default Spakrline;
