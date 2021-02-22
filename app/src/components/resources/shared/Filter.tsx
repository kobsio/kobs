import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Button,
  ButtonVariant,
  Flex,
  FlexItem,
  Select,
  SelectOption,
  SelectVariant,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import React, { useCallback, useEffect, useState } from 'react';
import FilterIcon from '@patternfly/react-icons/dist/js/icons/filter-icon';

import {
  GetClustersRequest,
  GetClustersResponse,
  GetNamespacesRequest,
  GetNamespacesResponse,
} from 'generated/proto/clusters_pb';
import { ClustersPromiseClient } from 'generated/proto/clusters_grpc_web_pb';
import { apiURL } from 'utils/constants';

const clustersService = new ClustersPromiseClient(apiURL, null, null);

interface IFilterProps {
  isLoading: boolean;
  onFilter: (clusters: string[], namespaces: string[]) => void;
}

// Filter is the component to display the cluster and namespace filter. It accepts a onFilter function, which is
// executed, when the user clicks the filter button. Besides this function is also accepts an loading identicator, which
// shows a spinner within the filter button, when it is true.
const Filter: React.FunctionComponent<IFilterProps> = ({ isLoading, onFilter }: IFilterProps) => {
  const [showClusters, setShowClusters] = useState<boolean>(false);
  const [showNamespaces, setShowNamespaces] = useState<boolean>(false);
  const [clusters, setClusters] = useState<string[]>([]);
  const [namespaces, setNamespaces] = useState<string[]>([]);
  const [selectedClusters, setSelectedClusters] = useState<string[]>([]);
  const [selectedNamespaces, setSelectedNamespaces] = useState<string[]>([]);
  const [error, setError] = useState<string>('');

  // onSelectCluster is executed, when a cluster is selected. When the cluster isn't in the list of selected clusters,
  // the cluster is added to this list. When the cluster is already in this list, it is removed.
  const onSelectCluster = (cluster: string): void => {
    if (selectedClusters.includes(cluster)) {
      setSelectedClusters(selectedClusters.filter((item) => item !== cluster));
    } else {
      setSelectedClusters([...selectedClusters, cluster]);
    }
  };

  // onSelectNamespace is executed, when a namespace is selected. When the namespace isn't in the list of selected
  // namespaces, the namespace is added to this list. When the namespace is already in this list, it is removed.
  const onSelectNamespace = (namespace: string): void => {
    if (selectedNamespaces.includes(namespace)) {
      setSelectedNamespaces(selectedNamespaces.filter((item) => item !== namespace));
    } else {
      setSelectedNamespaces([...selectedNamespaces, namespace]);
    }
  };

  // getClusters is executed, when the component is rendered the first time. It is used to retrieve the complete list of
  // clusters from the gRPC API. It also sets the first cluster from this list as the selected cluster.
  const getClusters = useCallback(async () => {
    try {
      const getClustersRequest = new GetClustersRequest();
      const getClustersResponse: GetClustersResponse = await clustersService.getClusters(getClustersRequest, null);
      const tmpClusters = getClustersResponse.getClustersList();

      if (tmpClusters.length === 0) {
        throw new Error('No clusters were found.');
      } else {
        setClusters(tmpClusters);
        setSelectedClusters([tmpClusters[0]]);
      }
    } catch (err) {
      setError(`Could not load clusters: ${err.message}`);
    }
  }, []);

  // getNamespaces is executed, when the list of selected clusters changed, to retrieve all namespaces for the list of
  // selected clusters.
  const getNamespaces = useCallback(async () => {
    if (selectedClusters.length > 0) {
      try {
        const getNamespacesRequest = new GetNamespacesRequest();
        getNamespacesRequest.setClustersList(selectedClusters);

        const getNamespacesResponse: GetNamespacesResponse = await clustersService.getNamespaces(
          getNamespacesRequest,
          null,
        );
        const tmpNamespaces = getNamespacesResponse.getNamespacesList();

        if (tmpNamespaces.length === 0) {
          setError('No namespaces were found.');
        } else {
          setNamespaces(tmpNamespaces);
          setError('');
        }
      } catch (err) {
        setError(`Could not load namespaces: ${err.message}`);
      }
    } else {
      setNamespaces([]);
      setSelectedNamespaces([]);
    }
  }, [selectedClusters]);

  useEffect(() => {
    getClusters();
  }, [getClusters]);

  useEffect(() => {
    getNamespaces();
  }, [getNamespaces]);

  // When an error occured during the API calls, we render an Alert instead of the components for filtering. The alert
  // component contains a link to retry the failed API call.
  if (error) {
    return (
      <Flex className="pf-u-mt-md" direction={{ default: 'column' }}>
        <FlexItem>
          <Alert
            variant={AlertVariant.danger}
            isInline={true}
            title="An error occured"
            actionLinks={
              <AlertActionLink onClick={(): Promise<void> => (clusters.length === 0 ? getClusters() : getNamespaces())}>
                Retry
              </AlertActionLink>
            }
          >
            <p>{error}</p>
          </Alert>
        </FlexItem>
      </Flex>
    );
  }

  return (
    <Toolbar id="filter" className="kobsio-pagesection-toolbar">
      <ToolbarContent>
        <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="lg">
          <ToolbarGroup>
            <ToolbarItem>
              <Select
                variant={SelectVariant.typeaheadMulti}
                typeAheadAriaLabel="Select clusters"
                placeholderText="Select clusters"
                onToggle={(): void => setShowClusters(!showClusters)}
                onSelect={(e, value): void => onSelectCluster(value as string)}
                onClear={(): void => setSelectedClusters([])}
                selections={selectedClusters}
                isOpen={showClusters}
              >
                {clusters.map((cluster, index) => (
                  <SelectOption key={index} value={cluster} />
                ))}
              </Select>
            </ToolbarItem>
            <ToolbarItem>
              <Select
                variant={SelectVariant.typeaheadMulti}
                typeAheadAriaLabel="Select namespaces"
                placeholderText="Select namespaces"
                onToggle={(): void => setShowNamespaces(!showNamespaces)}
                onSelect={(e, value): void => onSelectNamespace(value as string)}
                onClear={(): void => setSelectedNamespaces([])}
                selections={selectedNamespaces}
                isOpen={showNamespaces}
              >
                {namespaces.map((namespace, index) => (
                  <SelectOption key={index} value={namespace} />
                ))}
              </Select>
            </ToolbarItem>
            <ToolbarItem>
              <Button
                variant={ButtonVariant.primary}
                spinnerAriaValueText={isLoading ? 'Loading' : undefined}
                isLoading={isLoading}
                onClick={(): void => onFilter(selectedClusters, selectedNamespaces)}
              >
                Filter
              </Button>
            </ToolbarItem>
          </ToolbarGroup>
        </ToolbarToggleGroup>
      </ToolbarContent>
    </Toolbar>
  );
};

export default Filter;
