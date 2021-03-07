import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Card,
  CardActions,
  CardBody,
  CardHeader,
  CardHeaderMain,
} from '@patternfly/react-core';
import React, { useCallback, useEffect, useState } from 'react';

import { DatasourceMetrics, GetMetricsRequest, GetMetricsResponse } from 'generated/proto/datasources_pb';
import {
  IApplicationMetricsVariable,
  IDatasourceOptions,
  convertApplicationMetricsVariablesToProto,
  convertDatasourceOptionsToProto,
} from 'utils/proto';
import Actions from 'components/applications/details/metrics/charts/Actions';
import { ApplicationMetricsChart } from 'generated/proto/application_pb';
import { DatasourcesPromiseClient } from 'generated/proto/datasources_grpc_web_pb';
import DefaultChart from 'components/applications/details/metrics/charts/Default';
import EmptyStateSpinner from 'components/shared/EmptyStateSpinner';
import SparklineChart from 'components/applications/details/metrics/charts/Sparkline';
import { apiURL } from 'utils/constants';

const datasourcesService = new DatasourcesPromiseClient(apiURL, null, null);

interface IChartProps {
  datasourceName: string;
  datasourceType: string;
  datasourceOptions: IDatasourceOptions;
  variables: IApplicationMetricsVariable[];
  chart: ApplicationMetricsChart;
}

// Chart component is used to fetch the data for an chart and to render the chart within a Card component.
const Chart: React.FunctionComponent<IChartProps> = ({
  datasourceName,
  datasourceType,
  datasourceOptions,
  variables,
  chart,
}: IChartProps) => {
  const [data, setData] = useState<DatasourceMetrics[]>([]);
  const [interpolatedQueries, setInterpolatedQueries] = useState<string[]>([]);
  const [error, setError] = useState<string>('');

  // fetchData fetchs the data for a chart. If the gRPC call returns an error, we catch the error and set the
  // corresponding error state.
  const fetchData = useCallback(async () => {
    try {
      if (datasourceName !== '' && chart.getQueriesList().length > 0) {
        const getMetricsRequest = new GetMetricsRequest();
        getMetricsRequest.setName(datasourceName);
        getMetricsRequest.setOptions(convertDatasourceOptionsToProto(datasourceOptions));
        getMetricsRequest.setVariablesList(convertApplicationMetricsVariablesToProto(variables));
        getMetricsRequest.setQueriesList(chart.getQueriesList());

        const getMetricsResponse: GetMetricsResponse = await datasourcesService.getMetrics(getMetricsRequest, null);

        setInterpolatedQueries(getMetricsResponse.getInterpolatedqueriesList());
        setData(getMetricsResponse.getMetricsList());
        setError('');
      }
    } catch (err) {
      setError(err.message);
    }
  }, [datasourceName, datasourceOptions, variables, chart]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // If an error occured during the gRPC call we show the error message in the card body.
  if (error) {
    return (
      <Card isFlat={true}>
        <CardHeader>
          <CardHeaderMain>{chart.getTitle()}</CardHeaderMain>
        </CardHeader>
        <CardBody>
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
            <p>{error}</p>
          </Alert>
        </CardBody>
      </Card>
    );
  }

  // If the data length is zero, we show the empty state component with a spinner, because this only can happen on the
  // first render. When the fetchData all was executed the data must be set or the error will be rendered befor this.
  if (data.length === 0) {
    return (
      <Card isFlat={true}>
        <CardHeader>
          <CardHeaderMain>{chart.getTitle()}</CardHeaderMain>
        </CardHeader>
        <CardBody>
          <EmptyStateSpinner />
        </CardBody>
      </Card>
    );
  }

  return (
    <Card isFlat={true}>
      <CardHeader>
        <CardHeaderMain>{chart.getTitle()}</CardHeaderMain>
        <CardActions>
          <Actions
            datasourceName={datasourceName}
            datasourceType={datasourceType}
            datasourceOptions={datasourceOptions}
            interpolatedQueries={interpolatedQueries}
          />
        </CardActions>
      </CardHeader>
      <CardBody>
        {chart.getType() === 'sparkline' ? (
          <SparklineChart unit={chart.getUnit()} metrics={data} />
        ) : (
          <DefaultChart type={chart.getType()} unit={chart.getUnit()} stacked={chart.getStacked()} metrics={data} />
        )}
      </CardBody>
    </Card>
  );
};

export default Chart;
