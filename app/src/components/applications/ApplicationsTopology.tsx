import {
  Alert,
  AlertActionCloseButton,
  AlertActionLink,
  AlertGroup,
  AlertVariant,
  Spinner,
} from '@patternfly/react-core';
import React, { memo, useCallback, useEffect, useState } from 'react';
import cytoscape from 'cytoscape';

import {
  ClustersPromiseClient,
  GetApplicationRequest,
  GetApplicationResponse,
  GetApplicationsTopologyRequest,
  GetApplicationsTopologyResponse,
} from 'proto/clusters_grpc_web_pb';
import { Application } from 'proto/application_pb';
import ApplicationsTopologyGraph from 'components/applications/ApplicationsTopologyGraph';
import { apiURL } from 'utils/constants';

// clustersService is the Clusters gRPC service, which is used to get the application topology.
const clustersService = new ClustersPromiseClient(apiURL, null, null);

// IAlert is the interface for an alert. An alert in this component can be an error, when the fetchApplication fails or
// an information, which explains a dependency.
interface IAlert {
  title: string;
  details: string;
  variant: AlertVariant;
}

interface IDataState {
  edges: cytoscape.ElementDefinition[];
  error: string;
  nodes: cytoscape.ElementDefinition[];
  isLoading: boolean;
}

interface IApplicationsTopologyProps {
  clusters: string[];
  namespaces: string[];
  selectApplication: (application: Application.AsObject) => void;
}

// ApplicationsTopology is the component to display all applications inside a gallery view.
const ApplicationsTopology: React.FunctionComponent<IApplicationsTopologyProps> = ({
  clusters,
  namespaces,
  selectApplication,
}: IApplicationsTopologyProps) => {
  const [data, setData] = useState<IDataState>({ edges: [], error: '', isLoading: false, nodes: [] });
  const [alerts, setAlerts] = useState<IAlert[]>([]);

  // selectEdge is used to show an info alert, when the user clicks on an edge in the topology graph. The alert then
  // contains the description, which explains the dependency between the applications for this edge.
  const selectEdge = (title: string, description: string): void => {
    setAlerts((a) => [...a, { details: description, title: title, variant: AlertVariant.info }]);
  };

  // selectNode is triggered when the user selects an application node in the topology graph. It then triggers the
  // fetchApplication function to get the application details.
  const selectNode = (cluster: string, namespace: string, name: string): void => {
    fetchApplication(cluster, namespace, name);
  };

  // removeAlert is used to remove an alert from the list of alerts, when the user clicks the close button.
  const removeAlert = (index: number): void => {
    const tmpAlerts = [...alerts];
    tmpAlerts.splice(index, 1);
    setAlerts(tmpAlerts);
  };

  // fetchApplication is used to fetch an application, when the user selects a node in the topology graph. This
  // application is then shown in the drawer via the selectApplication function.
  const fetchApplication = useCallback(
    async (cluster: string, namespace: string, name: string) => {
      try {
        if (cluster && namespace && name) {
          const getApplicationRequest = new GetApplicationRequest();
          getApplicationRequest.setCluster(cluster);
          getApplicationRequest.setNamespace(namespace);
          getApplicationRequest.setName(name);

          const getApplicationResponse: GetApplicationResponse = await clustersService.getApplication(
            getApplicationRequest,
            null,
          );
          const tmpGetApplicationResponse = getApplicationResponse.toObject();
          if (tmpGetApplicationResponse.application) {
            selectApplication(tmpGetApplicationResponse.application);
          }
        }
      } catch (err) {
        setAlerts((a) => [
          ...a,
          { details: err.message, title: 'Could not get application', variant: AlertVariant.danger },
        ]);
      }
    },
    [selectApplication],
  );

  // fetchApplicationsTopology is used to get the list of nodes and edges for the given list of clusters and namespaces.
  // The list of nodes contains one node for each cluster, namespace and application. The list of edges represents the
  // dependencies between applications.
  const fetchApplicationsTopology = useCallback(async () => {
    try {
      if (clusters.length > 0 && namespaces.length > 0) {
        setData({ edges: [], error: '', isLoading: true, nodes: [] });

        const getApplicationsTopologyRequest = new GetApplicationsTopologyRequest();
        getApplicationsTopologyRequest.setClustersList(clusters);
        getApplicationsTopologyRequest.setNamespacesList(namespaces);

        const getApplicationsTopologyResponse: GetApplicationsTopologyResponse = await clustersService.getApplicationsTopology(
          getApplicationsTopologyRequest,
          null,
        );
        const tmpGetApplicationsTopologyResponse = getApplicationsTopologyResponse.toObject();

        setData({
          edges: tmpGetApplicationsTopologyResponse.edgesList.map((edge) => {
            return { data: edge };
          }),
          error: '',
          isLoading: false,
          nodes: tmpGetApplicationsTopologyResponse.nodesList.map((node) => {
            return { data: node };
          }),
        });
      }
    } catch (err) {
      setData({ edges: [], error: err.message, isLoading: false, nodes: [] });
    }
  }, [clusters, namespaces]);

  // useEffect is used to trigger the fetchApplicationsTopology function everytime the list of clusters or namespaces is
  // changed.
  useEffect(() => {
    fetchApplicationsTopology();
  }, [fetchApplicationsTopology]);

  if (data.isLoading) {
    return (
      <div className="pf-u-text-align-center">
        <Spinner />
      </div>
    );
  }

  if (data.error) {
    return (
      <Alert
        variant={AlertVariant.danger}
        title="Applications were not fetched"
        actionLinks={<AlertActionLink onClick={fetchApplicationsTopology}>Retry</AlertActionLink>}
      >
        <p>{data.error}</p>
      </Alert>
    );
  }

  return (
    <div style={{ height: '100%', minHeight: '100%' }}>
      <AlertGroup isToast={true}>
        {alerts.map((alert, index) => (
          <Alert
            key={index}
            isLiveRegion={true}
            variant={alert.variant}
            title={alert.title}
            actionClose={<AlertActionCloseButton onClick={(): void => removeAlert(index)} />}
          >
            <p>{alert.details}</p>
          </Alert>
        ))}
      </AlertGroup>
      <ApplicationsTopologyGraph
        edges={data.edges}
        nodes={data.nodes}
        selectEdge={selectEdge}
        selectNode={selectNode}
      />
    </div>
  );
};

export default memo(ApplicationsTopology, (prevProps, nextProps) => {
  if (
    JSON.stringify(prevProps.clusters) === JSON.stringify(nextProps.clusters) &&
    JSON.stringify(prevProps.namespaces) === JSON.stringify(nextProps.namespaces)
  ) {
    return true;
  }

  return false;
});
