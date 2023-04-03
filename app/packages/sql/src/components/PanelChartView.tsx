import { APIContext, APIError, IPluginInstance, PluginPanel, UseQueryWrapper } from '@kobsio/core';
import { useQuery } from '@tanstack/react-query';
import React, { useContext } from 'react';

import SQLChartSinglestats from './SQLChartSinglestats';
import { IChart, ISQLData } from './types';

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
        // todo add explore links
        <></>
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
      </UseQueryWrapper>
    </PluginPanel>
  );
};

export default PanelChartView;
