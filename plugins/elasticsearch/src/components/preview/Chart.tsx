import { Alert, AlertVariant, Spinner } from '@patternfly/react-core';
import React from 'react';
import { ResponsiveBarCanvas } from '@nivo/bar';
import { useQuery } from 'react-query';

import { ILogsData, IPanelOptions } from '../../utils/interfaces';
import { IPluginTimes } from '@kobsio/plugin-core';

interface IChartProps {
  name: string;
  times: IPluginTimes;
  title: string;
  options: IPanelOptions;
}

export const Chart: React.FunctionComponent<IChartProps> = ({ name, times, title, options }: IChartProps) => {
  const { isError, isLoading, data, error } = useQuery<ILogsData, Error>(
    ['elasticsearch/logs', name, options, times],
    async ({ pageParam }) => {
      try {
        if (
          !options ||
          !options.queries ||
          !Array.isArray(options.queries) ||
          options.queries.length === 0 ||
          !options.queries[0].query
        ) {
          throw new Error('Query is missing');
        }

        const response = await fetch(
          `/api/plugins/elasticsearch/logs/${name}?query=${options.queries[0].query}&timeStart=${times.timeStart}&timeEnd=${times.timeEnd}&scrollID=`,
          {
            method: 'get',
          },
        );
        const json = await response.json();

        if (response.status >= 200 && response.status < 300) {
          return json;
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
    {
      getNextPageParam: (lastPage, pages) => lastPage.scrollID,
      keepPreviousData: true,
    },
  );

  return (
    <div>
      {isLoading ? (
        <div className="pf-u-text-align-center">
          <Spinner />
        </div>
      ) : isError ? (
        <Alert variant={AlertVariant.danger} isInline={true} title={`Could not get metrics: ${error?.message}`} />
      ) : data ? (
        <div>
          <div className="pf-u-font-size-lg pf-u-text-nowrap pf-u-text-truncate">{data.hits} Hits</div>
          <div className="pf-u-font-size-sm pf-u-color-400 pf-u-text-nowrap pf-u-text-truncate">{title}</div>
          <div style={{ height: '75px' }}>
            {!data.buckets || data.buckets.length === 0 ? null : (
              <ResponsiveBarCanvas
                borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                borderRadius={0}
                borderWidth={0}
                colorBy="id"
                colors={['#0066cc']}
                data={data.buckets}
                enableLabel={false}
                enableGridX={false}
                enableGridY={false}
                groupMode="stacked"
                indexBy="time"
                indexScale={{ round: true, type: 'band' }}
                isInteractive={false}
                keys={['documents']}
                layout="vertical"
                margin={{ bottom: 0, left: 0, right: 0, top: 0 }}
                maxValue="auto"
                minValue="auto"
                reverse={false}
                valueFormat=""
                valueScale={{ type: 'linear' }}
              />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Chart;
