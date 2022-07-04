import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';

import { ILegend, ISQLData } from '../../utils/interfaces';
import { IPluginInstance } from '@kobsio/shared';
import { PluginPanel } from '@kobsio/shared';
import SQLChartActions from './SQLChartActions';
import SQLChartLine from './SQLChartLine';
import SQLChartLineLegend from './SQLChartLineLegend';
import SQLChartPie from './SQLChartPie';

interface ISQLChartProps {
  instance: IPluginInstance;
  title: string;
  description?: string;
  type: string;
  query: string;
  pieLabelColumn?: string;
  pieValueColumn?: string;
  xAxisColumn?: string;
  xAxisType?: string;
  xAxisUnit?: string;
  yAxisColumns?: string[];
  yAxisUnit?: string;
  yAxisStacked?: boolean;
  legend?: ILegend;
}

const SQLChart: React.FunctionComponent<ISQLChartProps> = ({
  instance,
  title,
  description,
  type,
  query,
  pieLabelColumn,
  pieValueColumn,
  xAxisColumn,
  xAxisType,
  xAxisUnit,
  yAxisColumns,
  yAxisUnit,
  yAxisStacked,
  legend,
}: ISQLChartProps) => {
  const { isError, isFetching, isLoading, error, data, refetch } = useQuery<ISQLData, Error>(
    ['sql/query', instance, query],
    async () => {
      try {
        const response = await fetch(`/api/plugins/sql/query?query=${encodeURIComponent(query)}`, {
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-kobs-plugin': instance.name,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-kobs-satellite': instance.satellite,
          },
          method: 'get',
        });
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
      keepPreviousData: true,
    },
  );

  return (
    <PluginPanel
      title={title}
      description={description}
      actions={<SQLChartActions instance={instance} query={query} isFetching={isFetching} />}
    >
      {isLoading ? (
        <div className="pf-u-text-align-center">
          <Spinner />
        </div>
      ) : isError ? (
        <Alert
          variant={AlertVariant.danger}
          isInline={true}
          title="Could not get query results"
          actionLinks={
            <React.Fragment>
              <AlertActionLink onClick={(): Promise<QueryObserverResult<ISQLData, Error>> => refetch()}>
                Retry
              </AlertActionLink>
            </React.Fragment>
          }
        >
          <p>{error?.message}</p>
        </Alert>
      ) : data && (type === 'line' || type === 'area') && xAxisColumn && yAxisColumns ? (
        <React.Fragment>
          <div style={{ height: 'calc(100% - 80px)' }}>
            <SQLChartLine
              data={data}
              type={type}
              xAxisColumn={xAxisColumn}
              xAxisType={xAxisType}
              xAxisUnit={xAxisUnit}
              yAxisColumns={yAxisColumns}
              yAxisUnit={yAxisUnit}
              yAxisStacked={yAxisStacked}
              legend={legend}
            />
          </div>

          <div className="pf-u-mt-md kobsio-hide-scrollbar" style={{ height: '60px', overflow: 'auto' }}>
            <SQLChartLineLegend data={data} yAxisColumns={yAxisColumns} yAxisUnit={yAxisUnit} legend={legend} />
          </div>
        </React.Fragment>
      ) : data && type === 'pie' && pieLabelColumn && pieValueColumn ? (
        <React.Fragment>
          <SQLChartPie data={data} pieLabelColumn={pieLabelColumn} pieValueColumn={pieValueColumn} />
        </React.Fragment>
      ) : (
        <Alert variant={AlertVariant.warning} isInline={true} title="No data found">
          <p>The query does not returned any data or a property for the selected chart is missing.</p>
        </Alert>
      )}
    </PluginPanel>
  );
};

export default SQLChart;