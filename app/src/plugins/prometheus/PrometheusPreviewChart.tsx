import { Alert, AlertVariant } from '@patternfly/react-core';
import { ChartArea, ChartGroup } from '@patternfly/react-charts';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
  Chart,
  GetMetricsRequest,
  GetMetricsResponse,
  Metrics,
  PrometheusPromiseClient,
  Query,
} from 'proto/prometheus_grpc_web_pb';
import { apiURL } from 'utils/constants';
import { transformData } from 'plugins/prometheus/helpers';

// prometheusService is the gRPC service to get the metrics for the defined query in a chart.
const prometheusService = new PrometheusPromiseClient(apiURL, null, null);

interface IDataState {
  error: string;
  metrics: Metrics.AsObject[];
}

interface IPrometheusPreviewChartProps {
  name: string;
  chart: Chart.AsObject;
}

const PrometheusPreviewChart: React.FunctionComponent<IPrometheusPreviewChartProps> = ({
  name,
  chart,
}: IPrometheusPreviewChartProps) => {
  const refChart = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [data, setData] = useState<IDataState>({ error: '', metrics: [] });

  const fetchData = useCallback(async () => {
    try {
      const query = new Query();
      query.setQuery(chart.queriesList[0].query);
      query.setLabel(chart.queriesList[0].label);

      const getMetricsRequest = new GetMetricsRequest();
      getMetricsRequest.setName(name);
      getMetricsRequest.setTimeend(Math.floor(Date.now() / 1000));
      getMetricsRequest.setTimestart(Math.floor(Date.now() / 1000) - 900);
      getMetricsRequest.setQueriesList([query]);
      getMetricsRequest.setVariablesList([]);

      const getMetricsResponse: GetMetricsResponse = await prometheusService.getMetrics(getMetricsRequest, null);
      setData({ error: '', metrics: getMetricsResponse.toObject().metricsList });
    } catch (err) {
      setData({ error: err.message, metrics: [] });
    }
  }, [name, chart]);

  // useEffect is executed on every render of this component. This is needed, so that we are able to use a width of 100%
  // and a static height for the chart.
  useEffect(() => {
    if (refChart && refChart.current) {
      setWidth(refChart.current.getBoundingClientRect().width);
      setHeight(refChart.current.getBoundingClientRect().height);
    }
  }, [data.metrics]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (data.error || data.metrics.length === 0) {
    return (
      <Alert variant={AlertVariant.danger} isInline={true} title={data.error ? data.error : 'Metrics not found.'} />
    );
  }

  return (
    <React.Fragment>
      <div className="pf-u-font-size-lg pf-u-text-nowrap pf-u-text-truncate">
        {data.metrics[0].dataList[data.metrics[0].dataList.length - 1].y.toFixed(2)} {chart.unit}
      </div>
      {chart.title ? (
        <div className="pf-u-font-size-sm pf-u-color-400  pf-u-text-nowrap pf-u-text-truncates">{chart.title}</div>
      ) : null}

      <div style={{ height: '75px', position: 'relative', width: '100%' }} ref={refChart}>
        <ChartGroup height={height} padding={0} width={width}>
          {data.metrics.map((metric, index) => (
            <ChartArea
              key={index}
              data={transformData(metric.dataList)}
              interpolation="monotoneX"
              name={`index${index}`}
            />
          ))}
        </ChartGroup>
      </div>
    </React.Fragment>
  );
};

export default PrometheusPreviewChart;
