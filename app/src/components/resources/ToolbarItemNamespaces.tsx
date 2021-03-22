import React, { useCallback, useEffect, useState } from 'react';
import { Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import { GetNamespacesRequest, GetNamespacesResponse } from 'proto/clusters_pb';
import { ClustersPromiseClient } from 'proto/clusters_grpc_web_pb';
import { apiURL } from 'utils/constants';

// clustersService is the Clusters gRPC service, which is used to get all namespaces for the selected clusters.
const clustersService = new ClustersPromiseClient(apiURL, null, null);

interface IToolbarItemNamespacesProps {
  selectedClusters: string[];
  selectedNamespaces: string[];
  selectNamespace: (namespace: string) => void;
}

// ToolbarItemNamespaces lets the user select a list of namespaces. The namespaced are retrieved dynamically by the list
// of selected clusters, so that only namespaces are shown, which are available for the list of selected clusters.
const ToolbarItemNamespaces: React.FunctionComponent<IToolbarItemNamespacesProps> = ({
  selectedClusters,
  selectedNamespaces,
  selectNamespace,
}: IToolbarItemNamespacesProps) => {
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [namespaces, setNamespaces] = useState<string[]>([]);

  // fetchNamespaces fetches a list of namespaces for the list of given clusters.
  const fetchNamespaces = useCallback(async () => {
    try {
      const getNamespacesRequest = new GetNamespacesRequest();
      getNamespacesRequest.setClustersList(selectedClusters);

      const getNamespacesResponse: GetNamespacesResponse = await clustersService.getNamespaces(
        getNamespacesRequest,
        null,
      );

      setIsError(false);
      setNamespaces(getNamespacesResponse.getNamespacesList());
    } catch (err) {
      setIsError(true);
      setNamespaces([err.message]);
    }
  }, [selectedClusters]);

  // useEffect is used to call the fetchNamespaces function on the first render of the component.
  useEffect(() => {
    fetchNamespaces();
  }, [fetchNamespaces]);

  return (
    <Select
      variant={SelectVariant.typeaheadMulti}
      typeAheadAriaLabel="Select namespaces"
      placeholderText="Select namespaces"
      onToggle={(): void => setShowOptions(!showOptions)}
      onSelect={(e, value): void => selectNamespace(value as string)}
      onClear={(): void => selectNamespace('')}
      selections={selectedNamespaces}
      isOpen={showOptions}
    >
      {namespaces.map((namespace, index) => (
        <SelectOption isDisabled={isError} key={index} value={namespace} />
      ))}
    </Select>
  );
};

export default ToolbarItemNamespaces;
