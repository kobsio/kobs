import { APIContext, APIError, IPluginInstance, ITimes, UseQueryWrapper } from '@kobsio/core';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext } from 'react';

import SQLChartGeneric from './SQLChartGeneric';
import { SQLChartPie } from './SQLChartPie';
import { SQLChartSinglestats } from './SQLChartSinglestats';

import { IChart, ISQLData } from '../utils/utils';

export const SQLChart: FunctionComponent<{ chart: IChart; instance: IPluginInstance; times: ITimes }> = ({
  chart,
  instance,
  times,
}) => {
  const apiContext = useContext(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<ISQLData, APIError>(
    ['sql/query', instance, chart.query, times],
    () => {
      return apiContext.client.get<ISQLData>(`/api/plugins/sql/query?query=${encodeURIComponent(chart.query ?? '')}`, {
        headers: {
          'x-kobs-cluster': instance.cluster,
          'x-kobs-plugin': instance.name,
        },
      });
    },
  );

  return (
    <UseQueryWrapper
      error={error}
      isError={isError}
      isLoading={isLoading}
      refetch={refetch}
      errorTitle="Failed to get data"
      isNoData={!data || !data.columns || data.columns.length === 0 || !data.rows || data.rows.length === 0}
      noDataTitle="No data was found"
    >
      {data && chart.type === 'pie' && chart.pieLabelColumn && chart.pieValueColumn && (
        <SQLChartPie data={data} pieLabelColumn={chart.pieLabelColumn} pieValueColumn={chart.pieValueColumn} />
      )}

      {data && chart.type === 'singlestat' && chart.yAxisColumns && (
        <SQLChartSinglestats
          data={data}
          yAxisColumns={chart.yAxisColumns}
          yAxisUnit={chart.yAxisUnit}
          legend={chart.legend}
          thresholds={chart.thresholds}
        />
      )}

      {data &&
        (chart.type === 'area' || chart.type === 'bar' || chart.type === 'line') &&
        chart.xAxisColumn &&
        chart.yAxisColumns && (
          <SQLChartGeneric
            data={data}
            type={chart.type}
            xAxisColumn={chart.xAxisColumn}
            yAxisColumns={chart.yAxisColumns}
            xAxisType={chart.xAxisType}
            legend={chart.legend}
            yAxisGroup={chart.yAxisGroup}
            yAxisStacked={chart.yAxisStacked}
            yAxisUnit={chart.yAxisUnit}
          />
        )}
    </UseQueryWrapper>
  );
};
