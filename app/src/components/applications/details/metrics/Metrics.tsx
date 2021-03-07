import { Alert, AlertActionLink, AlertVariant } from '@patternfly/react-core';
import React, { useCallback, useEffect, useState } from 'react';
import ChartAreaIcon from '@patternfly/react-icons/dist/js/icons/chart-area-icon';

import { GetDatasourceRequest, GetDatasourceResponse } from 'generated/proto/datasources_pb';
import {
  IApplicationMetricsVariable,
  IDatasourceOptions,
  convertApplicationMetricsVariablesFromProto,
} from 'utils/proto';
import { Application } from 'generated/proto/application_pb';
import Charts from 'components/applications/details/metrics/Charts';
import { DatasourcesPromiseClient } from 'generated/proto/datasources_grpc_web_pb';
import NotDefined from 'components/applications/details/NotDefined';
import Toolbar from 'components/applications/details/metrics/Toolbar';
import { apiURL } from 'utils/constants';

const datasourcesService = new DatasourcesPromiseClient(apiURL, null, null);

interface IMetricsProps {
  datasourceOptions: IDatasourceOptions;
  setDatasourceOptions: (options: IDatasourceOptions) => void;
  application: Application;
}

// Metrics the metrics component is used to display the metrics for an application. The metrics view consist of a
// toolbar, to display variables and different datasource specific options for the queries. It also contains a charts
// view, to display all user defined charts.
const Metrics: React.FunctionComponent<IMetricsProps> = ({
  datasourceOptions,
  setDatasourceOptions,
  application,
}: IMetricsProps) => {
  const metrics = application.getMetrics();

  const [datasourceName, setDatasourceName] = useState<string>('');
  const [datasourceType, setDatasourceType] = useState<string>('');
  const [variables, setVariables] = useState<IApplicationMetricsVariable[]>(
    metrics ? convertApplicationMetricsVariablesFromProto(metrics.getVariablesList()) : [],
  );
  const [error, setError] = useState<string>('');

  // fetchDatasourceDetails fetch all details, which are specific for a datasource. Currently this is only the type of
  // the datasource, but can be extended in the future if needed. More information can be found in the datasources.proto
  // file and the documentation for the GetDatasourceResponse message format.
  const fetchDatasourceDetails = useCallback(async () => {
    try {
      if (!metrics) {
        throw new Error('Metrics are not defined.');
      } else {
        const getDatasourceRequest = new GetDatasourceRequest();
        getDatasourceRequest.setName(metrics.getDatasource());

        const getDatasourceResponse: GetDatasourceResponse = await datasourcesService.getDatasource(
          getDatasourceRequest,
          null,
        );

        const datasource = getDatasourceResponse.getDatasource();
        if (datasource) {
          setDatasourceName(datasource.getName());
          setDatasourceType(datasource.getType());
          setError('');
        } else {
          throw new Error('Datasource is not defined.');
        }
      }
    } catch (err) {
      setError(err.message);
    }
  }, [metrics]);

  useEffect(() => {
    fetchDatasourceDetails();
  }, [fetchDatasourceDetails]);

  // If the metrics seticon in the Application CR isn't defined, we return the NotDefined component, with a link to the
  // documentation, where a user can find more information on who to define metrics.
  if (!metrics) {
    return (
      <NotDefined
        title="Metrics are not defined"
        description="Metrics are not defined in the CR for this application. Visit the documentation to learn more on how to define metrics within the Application CR."
        documentation="https://kobs.io"
        icon={ChartAreaIcon}
      />
    );
  }

  // If an error occured during, we show the user the error, with an option to retry the request.
  if (error) {
    return (
      <Alert
        variant={AlertVariant.danger}
        isInline={true}
        title="Could not get datasource details"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={fetchDatasourceDetails}>Retry</AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error}</p>
      </Alert>
    );
  }

  return (
    <React.Fragment>
      <Toolbar
        datasourcenName={datasourceName}
        datasourceType={datasourceType}
        datasourceOptions={datasourceOptions}
        setDatasourceOptions={setDatasourceOptions}
        variables={variables}
        setVariables={(vars): void => setVariables(vars)}
      />

      <Charts
        datasourceName={datasourceName}
        datasourceType={datasourceType}
        datasourceOptions={datasourceOptions}
        variables={variables}
        charts={metrics.getChartsList()}
      />
    </React.Fragment>
  );
};

export default Metrics;
