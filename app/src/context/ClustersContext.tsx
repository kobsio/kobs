import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import React, { useCallback, useEffect, useState } from 'react';

import {
  ClustersPromiseClient,
  GetCRDsRequest,
  GetCRDsResponse,
  GetClustersRequest,
  GetClustersResponse,
} from 'proto/clusters_grpc_web_pb';
import { IResources, customResourceDefinition } from 'utils/resources';
import { apiURL } from 'utils/constants';

// clustersService is the Clusters gRPC service, which is used to get all clusters and Custom Resource Definitions.
const clustersService = new ClustersPromiseClient(apiURL, null, null);

// IDataState is the state for the ClustersContext. The state contains all clusters and resources, an error message and
// a loading indicator.
interface IDataState {
  clusters: string[];
  error: string;
  isLoading: boolean;
  resources?: IResources;
}

// IClusterContext is the cluster context, is contains all clusters and resources.
export interface IClusterContext {
  clusters: string[];
  resources?: IResources;
}

// ClustersContext is the cluster context object.
export const ClustersContext = React.createContext<IClusterContext>({
  clusters: [],
  resources: undefined,
});

// ClustersContextConsumer is a React component that subscribes to context changes. This lets you subscribe to a context
// within a function component.
export const ClustersContextConsumer = ClustersContext.Consumer;

// IClustersContextProviderProps is the interface for the ClustersContextProvider component. The only valid properties
// are child components of the type ReactElement.
interface IClustersContextProviderProps {
  children: React.ReactElement;
}

// ClustersContextProvider is a Provider React component that allows consuming components to subscribe to context
// changes.
export const ClustersContextProvider: React.FunctionComponent<IClustersContextProviderProps> = ({
  children,
}: IClustersContextProviderProps) => {
  const [data, setData] = useState<IDataState>({
    clusters: [],
    error: '',
    isLoading: true,
    resources: undefined,
  });

  // fetchData is used to retrieve all clusters and Custom Resource Definitions from the gRPC API. The retrieved CRDs
  // are used in the resources property of the clusters context. The function is called on the first render of the
  // component and in case of an error it can be called via the retry button in the Alert component were the error
  // message is shown.
  const fetchData = useCallback(async () => {
    try {
      const getClustersRequest = new GetClustersRequest();
      const getClustersResponse: GetClustersResponse = await clustersService.getClusters(getClustersRequest, null);
      const tmpClusters = getClustersResponse.getClustersList();

      if (tmpClusters.length === 0) {
        throw new Error('No clusters were found.');
      } else {
        const getCRDsRequest = new GetCRDsRequest();
        const getCRDsResponse: GetCRDsResponse = await clustersService.getCRDs(getCRDsRequest, null);

        setData({
          clusters: tmpClusters,
          error: '',
          isLoading: false,
          resources: customResourceDefinition(getCRDsResponse.toObject().crdsList),
        });
      }
    } catch (err) {
      setData({
        clusters: [],
        error: err.message,
        isLoading: false,
        resources: undefined,
      });
    }
  }, []);

  // retry calls the fetchData function and can be triggered via the retry button in the Alert component in case of an
  // error. We can not call the fetchData function directly, because we have to set the isLoading property to true
  // first.
  const retry = (): void => {
    setData({ ...data, isLoading: true });
    fetchData();
  };

  // useEffect is used to call the fetchData function on the first render of the component.
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // As long as the isLoading property of the state is true, we are showing a spinner in the cernter of the screen.
  if (data.isLoading) {
    return <Spinner style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }} />;
  }

  // If an error occured during the fetch of the clusters or Custom Resource Definitions, we are showing the error
  // message in the cernter of the screen within an Alert component. The Alert component contains a Retry button to call
  // the fetchData function again.
  if (data.error) {
    return (
      <Alert
        style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }}
        variant={AlertVariant.danger}
        title="Could not initialize clusters context"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={retry}>Retry</AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{data.error}</p>
      </Alert>
    );
  }

  // If the fetching of the clusters and CRDs is finished and was successful, we render the context provider and pass in
  // the clusters and resources from the state.
  return (
    <ClustersContext.Provider
      value={{
        clusters: data.clusters,
        resources: data.resources,
      }}
    >
      {children}
    </ClustersContext.Provider>
  );
};
