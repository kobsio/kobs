import {
  APIContext,
  APIError,
  IPluginInstance,
  PluginPanel,
  PluginPanelActionLinks,
  UseQueryWrapper,
} from '@kobsio/core';
import { useQuery } from '@tanstack/react-query';
import React, { useContext } from 'react';

import SQLGenericChart from './SQLChartGeneric';
import SQLChartPie from './SQLChartPie';
import SQLChartSinglestats from './SQLChartSinglestats';
import { IChart, ISQLData } from './types';
import { uriFromQuery } from './utils/uriFromQuery';

interface ISQLChartProps {
  chart: IChart;
  description?: string;
  instance: IPluginInstance;
  query: string;
  title: string;
}

const PanelChartView: React.FunctionComponent<ISQLChartProps> = ({
  chart,
  description,
  instance,
  title,
  query,
}: ISQLChartProps) => {
  const { client } = useContext(APIContext);
  const queryResult = useQuery<ISQLData | null, APIError>(['sql/query', instance, query], () => {
    return client.get<ISQLData>(`/api/plugins/sql/query?query=${encodeURIComponent(query)}`, {
      headers: {
        'x-kobs-cluster': instance.cluster,
        'x-kobs-plugin': instance.name,
      },
    });
  });

  return (
    <PluginPanel
      title={title}
      description={description}
      actions={
        <PluginPanelActionLinks
          links={[
            {
              link: uriFromQuery(instance, chart.query),
              title: `explore "${chart.query}"`,
            },
          ]}
          isFetching={false}
        />
      }
    >
      <UseQueryWrapper
        isError={queryResult.isError}
        error={queryResult.error}
        isLoading={queryResult.isLoading}
        refetch={queryResult.refetch}
        errorTitle="Failed to load sql results"
        isNoData={!queryResult.data}
        noDataTitle="No rows found"
        noDataMessage="There were no rows found for the configured query"
      >
        {chart.type === 'pie' && (
          <SQLChartPie
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            data={queryResult.data!}
            pieLabelColumn={chart.pieLabelColumn}
            pieValueColumn={chart.pieValueColumn}
          />
        )}
        {chart.type === 'singlestat' && (
          <SQLChartSinglestats
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            data={queryResult.data!}
            yAxisColumns={chart.yAxisColumns}
            yAxisUnit={chart.yAxisUnit}
            legend={chart.legend}
            thresholds={chart.thresholds}
          />
        )}
        {(chart.type === 'area' || chart.type === 'bar' || chart.type === 'line') && (
          <SQLGenericChart
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            data={queryResult.data!}
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
    </PluginPanel>
  );
};

export default PanelChartView;
