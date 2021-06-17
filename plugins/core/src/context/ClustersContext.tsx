import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';

import { ICRD, IResources, customResourceDefinition } from '../utils/resources';

// IDataState is the state for the ClustersContext. The state contains all clusters and resources, an error message and
// a loading indicator.
interface IDataState {
  clusters: string[];
  resources?: IResources;
}

// IClusterContext is the cluster context, is contains all clusters and resources.
export interface IClusterContext {
  clusters: string[];
  getNamespaces: (clusters: string[]) => Promise<string[]>;
  resources?: IResources;
}

// ClustersContext is the cluster context object.
export const ClustersContext = React.createContext<IClusterContext>({
  clusters: [],
  getNamespaces: (clusters: string[]): Promise<string[]> => {
    return new Promise(() => {
      return [];
    });
  },
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
  // Retrieve all clusters and Custom Resource Definitions from the API server. The retrieved CRDs are used in the
  // resources property of the clusters context. The function is called on the first render of the component and in case
  // of an error it can be called via the retry button in the Alert component were the error message is shown.
  const { isError, isLoading, error, data, refetch } = useQuery<IDataState, Error>(
    ['shared/clusterscontext'],
    async () => {
      try {
        let clusters: string[] = [];
        let crds: ICRD[] = [];

        const responseClusters = await fetch('/api/clusters', { method: 'get' });
        const jsonClusters = await responseClusters.json();

        if (responseClusters.status >= 200 && responseClusters.status < 300) {
          clusters = jsonClusters;
        } else {
          if (jsonClusters.error) {
            throw new Error(jsonClusters.error);
          } else {
            throw new Error('An unknown error occured');
          }
        }

        const responseCRDs = await fetch('/api/clusters/crds', { method: 'get' });
        const jsonCRDs = await responseCRDs.json();

        if (responseCRDs.status >= 200 && responseCRDs.status < 300) {
          crds = jsonCRDs;
        } else {
          if (jsonCRDs.error) {
            throw new Error(jsonCRDs.message);
          } else {
            throw new Error('An unknown error occured');
          }
        }

        return {
          clusters: clusters,
          resources: customResourceDefinition(crds),
        };
      } catch (err) {
        throw err;
      }
    },
  );

  const getNamespaces = async (clusters: string[]): Promise<string[]> => {
    try {
      const clusterParams = clusters.map((cluster) => `cluster=${cluster}`).join('&');

      const response = await fetch(`/api/clusters/namespaces?${clusterParams}`, { method: 'get' });
      const json = await response.json();

      if (response.status >= 200 && response.status < 300) {
        return json;
      }

      return [];
    } catch (err) {
      return [];
    }
  };

  // As long as the isLoading property of the state is true, we are showing a spinner in the cernter of the screen.
  if (isLoading) {
    return <Spinner style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }} />;
  }

  // If an error occured during the fetch of the clusters or Custom Resource Definitions, we are showing the error
  // message in the cernter of the screen within an Alert component. The Alert component contains a Retry button to call
  // the fetchData function again.
  if (isError) {
    return (
      <Alert
        style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }}
        variant={AlertVariant.danger}
        title="Could not initialize clusters context"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IDataState, Error>> => refetch()}>
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error?.message}</p>
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  // If the fetching of the clusters and CRDs is finished and was successful, we render the context provider and pass in
  // the clusters and resources from the state.
  return (
    <ClustersContext.Provider
      value={{
        clusters: data.clusters,
        getNamespaces: getNamespaces,
        resources: data.resources,
      }}
    >
      {children}
    </ClustersContext.Provider>
  );
};
