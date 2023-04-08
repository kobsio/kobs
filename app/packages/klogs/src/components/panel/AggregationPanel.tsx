import {
  APIContext,
  UseQueryWrapper,
  IPluginPanelProps,
  PluginPanelError,
  PluginPanel,
  PluginPanelActionLinks,
  IPluginInstance,
  APIError,
} from '@kobsio/core';
import { useQuery } from '@tanstack/react-query';
import queryString from 'query-string';
import { FunctionComponent, useContext } from 'react';

import AggregationChart from '../page/AggregationChart';
import { IAggregationData, IChartOptions } from '../page/AggregationTypes';
import { chartOptionsToRequestOptions } from '../utils/aggregation';
import isString from '../utils/isString';

export type IOptions = IChartOptions & {
  query: string;
  type: 'aggregation';
};

// type guard for options
const isValid = (options?: IOptions): options is IOptions => {
  if (!options) {
    return false;
  }

  if (!isString(options.query)) {
    return false;
  }

  // runtime checks become fairly complicated from here on
  // in future we should check these polimorphic properties with something like zod (https://zod.dev/)
  // for now we send an API request and tell the user to check the provided options, when the server responds with an error

  return true;
};

// utility for creating a uri that directs the user to the correct klogs instance, where
// both the query and fields are already selected
const uriFromOptions = (instance: IPluginInstance, options: IOptions) => {
  const path = `/plugins/${instance.cluster}/klogs/${instance.name}/aggregation`;
  const search = queryString.stringify(options, { arrayFormat: 'bracket', skipEmptyString: false, skipNull: false });

  return [path, search].join('?');
};

/**
 * AggregationPanel renders a chart
 * the chart type is determined by the options.chart property
 * the chart must satisfy the IChartOptions interface
 */
const AggregationPanel: FunctionComponent<IPluginPanelProps<IOptions>> = ({
  instance,
  options,
  times,
  title,
  description,
}) => {
  const { client } = useContext(APIContext);
  const queryResult = useQuery<IAggregationData | null, APIError>(
    ['klogs/aggregation', instance, options, times],
    async () => {
      if (!options) {
        return null;
      }

      return client.post<IAggregationData>('/api/plugins/klogs/aggregation', {
        body: {
          chart: options.chart,
          options: chartOptionsToRequestOptions(options),
          query: options.query,
          times: times,
        },

        headers: {
          'x-kobs-cluster': instance.cluster,
          'x-kobs-plugin': instance.name,
        },
      });
    },
  );

  if (!isValid(options) || queryResult.isError) {
    return (
      <PluginPanelError
        title={title}
        description={description}
        message="Invalid options for klogs plugin"
        details={`The provided options appear to be incorrect, reason: ${queryResult.error?.message}`}
        example={`plugin:
  name: klogs
  type: klogs
  options:
    type: aggregation,
    chart: line,
    query: namespace = 'kube-system',
    horizontalAxisOperation: time,
    verticalAxisOperation: count`}
        documentation="https://kobs.io/main/plugins/klogs/#panel-options"
      />
    );
  }

  return (
    <UseQueryWrapper
      {...queryResult}
      errorTitle="Failed to load Aggregation Panel"
      isNoData={!queryResult.data}
      noDataTitle="No results found"
      noDataMessage="No datapoints were found for this panel."
    >
      <PluginPanel
        title={title}
        actions={
          <PluginPanelActionLinks
            links={[
              {
                link: uriFromOptions(instance, options),
                title: `explore "${options.query}"`,
              },
            ]}
            isFetching={false}
          />
        }
      >
        {queryResult.data && options && <AggregationChart data={queryResult.data} options={options} />}
      </PluginPanel>
    </UseQueryWrapper>
  );
};

export default AggregationPanel;
