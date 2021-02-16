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
} from '@patternfly/react-core';
import React, { useCallback, useEffect, useState } from 'react';

import {
  GetClustersRequest,
  GetClustersResponse,
  GetNamespacesRequest,
  GetNamespacesResponse,
} from '../../generated/proto/clusters_pb';
import { ClustersPromiseClient } from '../../generated/proto/clusters_grpc_web_pb';
import { apiURL } from '../../utils/constants';

const clustersService = new ClustersPromiseClient(apiURL, null, null);

interface FilterProps {
  isLoading: boolean;
  onFilter: (clusters: string[], namespaces: string[]) => void;
}

const Filter: React.FunctionComponent<FilterProps> = ({ isLoading, onFilter }: FilterProps) => {
  const [showClusters, setShowClusters] = useState<boolean>(false);
  const [showNamespaces, setShowNamespaces] = useState<boolean>(false);
  const [clusters, setClusters] = useState<string[]>([]);
  const [namespaces, setNamespaces] = useState<string[]>([]);
  const [selectedClusters, setSelectedClusters] = useState<string[]>([]);
  const [selectedNamespaces, setSelectedNamespaces] = useState<string[]>([]);
  const [error, setError] = useState<string>('');

  const onSelectCluster = (cluster: string): void => {
    if (selectedClusters.includes(cluster)) {
      setSelectedClusters(selectedClusters.filter((item) => item !== cluster));
    } else {
      setSelectedClusters([...selectedClusters, cluster]);
    }
  };

  const onSelectNamespace = (namespace: string): void => {
    if (selectedNamespaces.includes(namespace)) {
      setSelectedNamespaces(selectedNamespaces.filter((item) => item !== namespace));
    } else {
      setSelectedNamespaces([...selectedNamespaces, namespace]);
    }
  };

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

  if (error) {
    return (
      <Flex direction={{ default: 'column' }}>
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
    <Flex>
      <FlexItem>
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
      </FlexItem>

      <FlexItem>
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
      </FlexItem>

      <FlexItem>
        <Button
          variant={ButtonVariant.primary}
          spinnerAriaValueText={isLoading ? 'Loading' : undefined}
          isLoading={isLoading}
          onClick={(): void => onFilter(selectedClusters, selectedNamespaces)}
        >
          Filter
        </Button>
      </FlexItem>
    </Flex>
  );
};

export default Filter;
