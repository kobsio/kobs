import { Alert, AlertVariant } from '@patternfly/react-core';
import { ChartBar, ChartGroup } from '@patternfly/react-charts';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
  Bucket,
  ElasticsearchPromiseClient,
  GetLogsRequest,
  GetLogsResponse,
  Query,
} from 'proto/elasticsearch_grpc_web_pb';
import { apiURL } from 'utils/constants';

// elasticsearchService is the gRPC service to get the number of documents and buckets for the defined query.
const elasticsearchService = new ElasticsearchPromiseClient(apiURL, null, null);

interface IDataState {
  buckets: Bucket.AsObject[];
  error: string;
  hits: number;
}

interface IElasticsearchPreviewChartProps {
  name: string;
  query: Query.AsObject;
}

const ElasticsearchPreviewChart: React.FunctionComponent<IElasticsearchPreviewChartProps> = ({
  name,
  query,
}: IElasticsearchPreviewChartProps) => {
  const refChart = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [data, setData] = useState<IDataState>({ buckets: [], error: '', hits: 0 });

  const fetchData = useCallback(async () => {
    try {
      const q = new Query();
      q.setQuery(query.query);

      const getLogsRequest = new GetLogsRequest();
      getLogsRequest.setName(name);
      getLogsRequest.setScrollid('');
      getLogsRequest.setTimeend(Math.floor(Date.now() / 1000));
      getLogsRequest.setTimestart(Math.floor(Date.now() / 1000) - 900);
      getLogsRequest.setQuery(q);

      const getLogsResponse: GetLogsResponse = await elasticsearchService.getLogs(getLogsRequest, null);
      const tmpLogsResponse = getLogsResponse.toObject();

      setData({ buckets: tmpLogsResponse.bucketsList, error: '', hits: tmpLogsResponse.hits });
    } catch (err) {
      setData({ buckets: [], error: err.message, hits: 0 });
    }
  }, [name, query]);

  // useEffect is executed on every render of this component. This is needed, so that we are able to use a width of 100%
  // and a static height for the chart.
  useEffect(() => {
    if (refChart && refChart.current) {
      setWidth(refChart.current.getBoundingClientRect().width);
      setHeight(refChart.current.getBoundingClientRect().height);
    }
  }, [data.buckets]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (data.error) {
    return (
      <Alert variant={AlertVariant.danger} isInline={true} title={data.error ? data.error : 'Metrics not found.'} />
    );
  }

  return (
    <React.Fragment>
      <div className="pf-u-font-size-lg pf-u-text-nowrap pf-u-text-truncate">{data.hits} Hits</div>
      {query.name ? (
        <div className="pf-u-font-size-sm pf-u-color-400  pf-u-text-nowrap pf-u-text-truncates">{query.name}</div>
      ) : null}

      <div style={{ height: '75px', position: 'relative', width: '100%' }} ref={refChart}>
        <ChartGroup height={height} padding={0} width={width}>
          <ChartBar data={data.buckets} name="count" barWidth={width / data.buckets.length} />
        </ChartGroup>
      </div>
    </React.Fragment>
  );
};

export default ElasticsearchPreviewChart;
