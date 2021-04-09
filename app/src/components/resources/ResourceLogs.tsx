import { Alert, AlertVariant, Card, Checkbox, Spinner } from '@patternfly/react-core';
import React, { useCallback, useEffect, useState } from 'react';
import { V1Pod } from '@kubernetes/client-node';

import { ClustersPromiseClient, GetLogsRequest, GetLogsResponse } from 'proto/clusters_grpc_web_pb';
import ResourceLogsToolbar, { IOptions } from 'components/resources/ResourceLogsToolbar';
import { apiURL } from 'utils/constants';

// clustersService is the Clusters gRPC service, which is used to get the logs for a pod.
const clustersService = new ClustersPromiseClient(apiURL, null, null);

// getContainers returns a list with all container names for the given Pod. It contains all specified init containers
// and the "normal" containers.
const getContainers = (pod: V1Pod): string[] => {
  const containers: string[] = [];

  if (pod.spec?.initContainers) {
    for (const container of pod.spec?.initContainers) {
      containers.push(container.name);
    }
  }

  if (pod.spec?.containers) {
    for (const container of pod.spec?.containers) {
      containers.push(container.name);
    }
  }

  return containers;
};

// IDataState is the interface for the data state of the ResourceLogs component. It contains an error message, loading
// indicator and the log lines.
interface IDataState {
  error: string;
  isLoading: boolean;
  logs: string[];
}

interface IResourceLogsProps {
  cluster: string;
  namespace: string;
  name: string;
  pod: V1Pod;
}

// ResourceLogs is the component, which is used in the logs tab of an Pod. It allows a user to retrieve the logs for an
// Pod from the Kubernetes API.
const ResourceLogs: React.FunctionComponent<IResourceLogsProps> = ({
  cluster,
  namespace,
  name,
  pod,
}: IResourceLogsProps) => {
  const containers = getContainers(pod);

  // Initialize the states for the component. We do not set an inital container, to avoid the first request against the
  // Kubernetes API to retrieve the logs. The user should select is options first and then trigger the API call via the
  // search button.
  const [data, setData] = useState<IDataState>({ error: '', isLoading: false, logs: [] });
  const [noWrap, setNoWrap] = useState<boolean>(false);
  const [options, setOptions] = useState<IOptions>({
    container: '',
    containers: containers,
    previous: false,
    regex: '',
    since: 3600,
  });

  // fetchLogs is the function, which is used to get all logs from the gRPC API server. We check the returned log lines
  // and when the last line is empty ("") we remove it. This can happen, because we split the log line by the newline
  // character in the gRPC function.
  const fetchLogs = useCallback(async () => {
    try {
      if (options.container) {
        setData({ error: '', isLoading: true, logs: [] });
        const getLogsRequest = new GetLogsRequest();
        getLogsRequest.setCluster(cluster);
        getLogsRequest.setNamespace(namespace);
        getLogsRequest.setName(name);
        getLogsRequest.setContainer(options.container);
        getLogsRequest.setRegex(options.regex);
        getLogsRequest.setSince(options.since);
        getLogsRequest.setPrevious(options.previous);

        const getResourcesResponse: GetLogsResponse = await clustersService.getLogs(getLogsRequest, null);
        const logsList = getResourcesResponse.getLogsList();

        if (logsList.length > 0 && logsList[logsList.length - 1] === '') {
          logsList.pop();
        }

        setData({ error: '', isLoading: false, logs: logsList });
      }
    } catch (err) {
      setData({ error: err.message, isLoading: false, logs: [] });
    }
  }, [cluster, namespace, name, options.container, options.previous, options.regex, options.since]);

  // useEffect is used to call the fetchLogs function everytime, the cluster, namespace, name or one of the options is
  // changed.
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <React.Fragment>
      <ResourceLogsToolbar options={options} setOptions={setOptions} />
      <p>&nbsp;</p>

      {data.isLoading ? (
        <div className="pf-u-text-align-center">
          <Spinner />
        </div>
      ) : data.error ? (
        <Alert variant={AlertVariant.danger} title="Could not get logs">
          <p>{data.error}</p>
        </Alert>
      ) : data.logs && data.logs.length > 0 ? (
        <Card style={{ maxWidth: '100%', overflowX: 'scroll', padding: '16px' }}>
          <Checkbox
            label="No wrap"
            isChecked={noWrap}
            onChange={setNoWrap}
            aria-label="No wrap"
            id="logs-no-wrap"
            name="logs-no-wrap"
          />
          <p>&nbsp;</p>
          {data.logs.map((line, index) => (
            <div key={index} className={noWrap ? 'pf-u-text-nowrap' : ''}>
              {line}
            </div>
          ))}
        </Card>
      ) : (
        <Alert variant={AlertVariant.info} title="Usage">
          <p>
            Select a container and time range, then click the search button to show the logs for the selected container.
            You can also specify a regular expression to filter the returned log lines.
          </p>
        </Alert>
      )}
      {data.isLoading || data.error || !data.logs || data.logs.length < containers.length ? (
        <div>
          {containers.map((container, index) => (
            <p key={index}>&nbsp;</p>
          ))}
          <p>&nbsp;</p>
        </div>
      ) : null}
    </React.Fragment>
  );
};

export default ResourceLogs;
