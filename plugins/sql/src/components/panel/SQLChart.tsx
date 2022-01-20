import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';

import { ILegend, ISQLData } from '../../utils/interfaces';
import { PluginCard } from '@kobsio/plugin-core';
import SQLChartActions from './SQLChartActions';
import SQLChartLine from './SQLChartLine';
import SQLChartLineLegend from './SQLChartLineLegend';
import SQLChartPie from './SQLChartPie';

interface ISQLChartProps {
  name: string;
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
  name,
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
    ['sql/query', name, query],
    async () => {
      try {
        const response = await fetch(`/api/plugins/sql/${name}/query?query=${encodeURIComponent(query)}`, {
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
    <PluginCard
      title={title}
      description={description}
      actions={<SQLChartActions name={name} query={query} isFetching={isFetching} />}
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

          <div className="pf-u-mt-md" style={{ height: '60px', overflow: 'scroll' }}>
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
    </PluginCard>
  );
};

export default SQLChart;
