import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Card,
  CardActions,
  CardBody,
  CardHeader,
  CardHeaderMain,
  EmptyState,
  EmptyStateIcon,
  Spinner,
} from '@patternfly/react-core';
import React, { useCallback, useEffect, useState } from 'react';

import {
  Chart,
  GetMetricsRequest,
  GetMetricsResponse,
  Metrics,
  PrometheusPromiseClient,
  Query,
  Variable,
} from 'proto/prometheus_grpc_web_pb';
import { ITimes } from 'plugins/prometheus/helpers';
import PrometheusChartActions from 'plugins/prometheus/PrometheusChartActions';
import PrometheusChartDefault from 'plugins/prometheus/PrometheusChartDefault';
import PrometheusChartSparkline from 'plugins/prometheus/PrometheusChartSparkline';
import { apiURL } from 'utils/constants';

// prometheusService is the gRPC service to get the metrics for all defined queries in a chart.
const prometheusService = new PrometheusPromiseClient(apiURL, null, null);

interface IDataState {
  error: string;
  interpolatedQueries: string[];
  isLoading: boolean;
  metrics: Metrics.AsObject[];
}

interface IPrometheusPluginChartProps {
  name: string;
  times: ITimes;
  variables: Variable.AsObject[];
  chart: Chart.AsObject;
}

// PrometheusPluginChart is a wrapper component for each Prometheus chart. It is used to load all the metrics and based
// on the result to show the correct chart.
const PrometheusPluginChart: React.FunctionComponent<IPrometheusPluginChartProps> = ({
  name,
  times,
  variables,
  chart,
}: IPrometheusPluginChartProps) => {
  const [data, setData] = useState<IDataState>({ error: '', interpolatedQueries: [], isLoading: false, metrics: [] });

  // fetchData fetches the metrics for the given chart definition and the loaded variable values.
  const fetchData = useCallback(async () => {
    try {
      if (name !== '' && chart.queriesList.length > 0) {
        setData({ error: '', interpolatedQueries: [], isLoading: true, metrics: [] });

        const queries: Query[] = [];
        for (const q of chart.queriesList) {
          const query = new Query();
          query.setQuery(q.query);
          query.setLabel(q.label);
          queries.push(query);
        }

        const vars: Variable[] = [];
        for (const variable of variables) {
          const v = new Variable();
          v.setName(variable.name);
          v.setLabel(variable.label);
          v.setQuery(variable.query);
          v.setAllowall(variable.allowall);
          v.setValuesList(variable.valuesList);
          v.setValue(variable.value);
          vars.push(v);
        }

        const getMetricsRequest = new GetMetricsRequest();
        getMetricsRequest.setName(name);
        getMetricsRequest.setTimeend(times.timeEnd);
        getMetricsRequest.setTimestart(times.timeStart);
        getMetricsRequest.setQueriesList(queries);
        getMetricsRequest.setVariablesList(vars);

        const getMetricsResponse: GetMetricsResponse = await prometheusService.getMetrics(getMetricsRequest, null);
        setData({
          error: '',
          interpolatedQueries: getMetricsResponse.toObject().interpolatedqueriesList,
          isLoading: false,
          metrics: getMetricsResponse.toObject().metricsList,
        });
      }
    } catch (err) {
      setData({ error: err.message, interpolatedQueries: [], isLoading: false, metrics: [] });
    }
  }, [name, times, variables, chart]);

  // useEffect is used to call the fetchData function every time a property of the component is updated.
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Card>
      <CardHeader>
        <CardHeaderMain>{chart.title}</CardHeaderMain>
        <CardActions>
          <PrometheusChartActions name={name} times={times} interpolatedQueries={data.interpolatedQueries} />
        </CardActions>
      </CardHeader>
      <CardBody>
        {data.isLoading ? (
          <EmptyState>
            <EmptyStateIcon variant="container" component={Spinner} />
          </EmptyState>
        ) : data.error ? (
          <Alert
            variant={AlertVariant.danger}
            isInline={true}
            title="Could not get metrics"
            actionLinks={
              <React.Fragment>
                <AlertActionLink onClick={fetchData}>Retry</AlertActionLink>
              </React.Fragment>
            }
          >
            <p>{data.error}</p>
          </Alert>
        ) : chart.type === 'sparkline' ? (
          <PrometheusChartSparkline unit={chart.unit} metrics={data.metrics} mappings={chart.mappingsMap} />
        ) : (
          <PrometheusChartDefault
            type={chart.type}
            unit={chart.unit}
            stacked={chart.stacked}
            legend={chart.legend}
            metrics={data.metrics}
          />
        )}
      </CardBody>
    </Card>
  );
};

export default PrometheusPluginChart;
