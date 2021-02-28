import { CardBody, CardTitle, Card as PatternflyCard } from '@patternfly/react-core';
import React, { useCallback, useEffect, useState } from 'react';

import {
  DatasourceMetrics,
  DatasourceOptions,
  GetMetricsRequest,
  GetMetricsResponse,
} from 'generated/proto/datasources_pb';
import { Application } from 'generated/proto/application_pb';
import Chart from 'components/applications/overview/Chart';
import { DatasourcesPromiseClient } from 'generated/proto/datasources_grpc_web_pb';
import { apiURL } from 'utils/constants';

const datasourcesService = new DatasourcesPromiseClient(apiURL, null, null);

interface ICardProps {
  application: Application;
  select: (application: Application) => void;
}

// Card displays a single application within the Applications gallery. The component requires the application and a
// select function as props. The select function is called, when the user clicks on the card. In the applications pages,
// this will then open the drawer with the selected application.
const Card: React.FunctionComponent<ICardProps> = ({ application, select }: ICardProps) => {
  const metrics = application.getMetrics();

  const [data, setData] = useState<DatasourceMetrics[]>([]);
  const [error, setError] = useState<string>('');

  // fetchData is used to fetch the data for the health metric of an Application. The data is then displayed as
  // sparkline within the card for the application in the gallery.
  const fetchData = useCallback(async () => {
    try {
      if (metrics && metrics.hasHealth()) {
        const options = new DatasourceOptions();
        options.setTimeend(Math.floor(Date.now() / 1000));
        options.setTimestart(Math.floor(Date.now() / 1000) - 3600);

        const getMetricsRequest = new GetMetricsRequest();
        getMetricsRequest.setName(metrics.getDatasource());
        getMetricsRequest.setOptions(options);

        const health = metrics.getHealth();
        if (health) {
          getMetricsRequest.setQueriesList(health.getQueriesList());
        }

        const getMetricsResponse: GetMetricsResponse = await datasourcesService.getMetrics(getMetricsRequest, null);

        setData(getMetricsResponse.getMetricsList());
        setError('');
      }
    } catch (err) {
      setError(err.message);
    }
  }, [metrics]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // The card for an application can have three different state. When an error occured during the data fetch, we display
  // this error on the card. When all data was successfully loaded we display the sparkline. If the application doesn't
  // define a health chart, we just display the namespace and cluster for the application in the card body.
  return (
    <PatternflyCard isSelectable={true} onClick={(): void => select(application)}>
      <CardTitle>{application.getName()}</CardTitle>
      {error ? (
        <CardBody>Could not get health data: {error}</CardBody>
      ) : data.length > 0 && metrics && metrics.hasHealth() ? (
        <CardBody>
          <Chart title={metrics.getHealth()?.getTitle()} unit={metrics.getHealth()?.getUnit()} metrics={data} />
        </CardBody>
      ) : (
        <CardBody>
          <div>Namespace: {application.getNamespace()}</div>
          <div>Cluster: {application.getCluster()}</div>
        </CardBody>
      )}
    </PatternflyCard>
  );
};

export default Card;
