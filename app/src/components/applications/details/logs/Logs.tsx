import { Alert, AlertActionLink, AlertVariant } from '@patternfly/react-core';
import React, { useCallback, useEffect, useState } from 'react';
import ChartAreaIcon from '@patternfly/react-icons/dist/js/icons/chart-area-icon';

import { Application, ApplicationLogsQuery } from 'generated/proto/application_pb';
import { GetDatasourceRequest, GetDatasourceResponse } from 'generated/proto/datasources_pb';
import { DatasourcesPromiseClient } from 'generated/proto/datasources_grpc_web_pb';
import Elasticsearch from 'components/applications/details/logs/Elasticsearch';
import { IDatasourceOptions } from 'utils/proto';
import NotDefined from 'components/applications/details/NotDefined';
import Toolbar from 'components/applications/details/logs/Toolbar';
import { apiURL } from 'utils/constants';

const datasourcesService = new DatasourcesPromiseClient(apiURL, null, null);

interface ILogsProps {
  datasourceOptions: IDatasourceOptions;
  setDatasourceOptions: (options: IDatasourceOptions) => void;
  application: Application;
}

// Logs is the component, which is shown inside the logs tab of an application. It is used as wrapper component for the
// toolbar and results component. For the results we show different components, depending on the datasource type.
const Logs: React.FunctionComponent<ILogsProps> = ({
  datasourceOptions,
  setDatasourceOptions,
  application,
}: ILogsProps) => {
  const logs = application.getLogs();

  const [datasourceName, setDatasourceName] = useState<string>('');
  const [datasourceType, setDatasourceType] = useState<string>('');
  const [query, setQuery] = useState<ApplicationLogsQuery | undefined>(logs ? logs.getQueriesList()[0] : undefined);
  const [error, setError] = useState<string>('');

  // fetchDatasourceDetails fetch all details, which are specific for a datasource. Currently this is only the type of
  // the datasource, but can be extended in the future if needed. More information can be found in the datasources.proto
  // file and the documentation for the GetDatasourceResponse message format.
  const fetchDatasourceDetails = useCallback(async () => {
    try {
      if (!logs) {
        throw new Error('Logs are not defined.');
      } else {
        const getDatasourceRequest = new GetDatasourceRequest();
        getDatasourceRequest.setName(logs.getDatasource());

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
  }, [logs]);

  useEffect(() => {
    fetchDatasourceDetails();
  }, [fetchDatasourceDetails]);

  // If the logs seticon in the Application CR isn't defined, we return the NotDefined component, with a link to the
  // documentation, where a user can find more information on who to define logs.
  if (!logs) {
    return (
      <NotDefined
        title="Logs are not defined"
        description="Logs are not defined in the CR for this application. Visit the documentation to learn more on how to define logs within the Application CR."
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
    <div className="kobs-drawer-pagesection">
      <Toolbar
        datasourcenName={datasourceName}
        datasourceType={datasourceType}
        datasourceOptions={datasourceOptions}
        setDatasourceOptions={setDatasourceOptions}
        queries={logs.getQueriesList()}
        query={query}
        selectQuery={(q: ApplicationLogsQuery): void => setQuery(q)}
      />

      {datasourceType === 'elasticsearch' ? (
        <Elasticsearch
          query={query?.getQuery()}
          fields={query?.getFieldsList()}
          datasourceName={datasourceName}
          datasourceType={datasourceType}
          datasourceOptions={datasourceOptions}
        />
      ) : null}
    </div>
  );
};

export default Logs;
