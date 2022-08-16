import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React from 'react';

import { ILegend, ISQLData, IThresholds } from '../../utils/interfaces';
import { IPluginInstance } from '@kobsio/shared';
import { PluginPanel } from '@kobsio/shared';
import SQLChartActions from './SQLChartActions';
import SQLChartLine from './SQLChartLine';
import SQLChartPie from './SQLChartPie';
import SQLChartSinglestats from './SQLChartSinglestats';

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
  yAxisGroup?: string;
  yAxisStacked?: boolean;
  legend?: ILegend;
  thresholds?: IThresholds;
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
  yAxisGroup,
  yAxisStacked,
  legend,
  thresholds,
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
          <SQLChartLine
            data={data}
            type={type}
            xAxisColumn={xAxisColumn}
            xAxisType={xAxisType}
            xAxisUnit={xAxisUnit}
            yAxisColumns={yAxisColumns}
            yAxisUnit={yAxisUnit}
            yAxisGroup={yAxisGroup}
            yAxisStacked={yAxisStacked}
            legend={legend}
          />
        </React.Fragment>
      ) : data && type === 'pie' && pieLabelColumn && pieValueColumn ? (
        <React.Fragment>
          <SQLChartPie data={data} pieLabelColumn={pieLabelColumn} pieValueColumn={pieValueColumn} />
        </React.Fragment>
      ) : data && type === 'singlestats' && yAxisColumns ? (
        <React.Fragment>
          <SQLChartSinglestats
            data={data}
            yAxisColumns={yAxisColumns}
            yAxisUnit={yAxisUnit}
            legend={legend}
            thresholds={thresholds}
          />
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
