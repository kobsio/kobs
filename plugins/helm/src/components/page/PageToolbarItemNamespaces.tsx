import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import { ClustersContext, IClusterContext } from '@kobsio/plugin-core';

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
  const clustersContext = useContext<IClusterContext>(ClustersContext);
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [namespaces, setNamespaces] = useState<string[]>([]);

  // fetchNamespaces fetches a list of namespaces for the list of given clusters.
  const fetchNamespaces = useCallback(async () => {
    if (selectedClusters.length > 0) {
      const tmpNamespaces = await clustersContext.getNamespaces(selectedClusters);
      setNamespaces(tmpNamespaces);
    }
  }, [clustersContext, selectedClusters]);

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
      onFilter={(e: React.ChangeEvent<HTMLInputElement> | null, value: string): React.ReactElement[] =>
        namespaces
          .filter((ns) => !value || ns.includes(value))
          .map((namespace: string) => <SelectOption key={namespace} value={namespace} />)
      }
    >
      {namespaces.map((namespace) => (
        <SelectOption key={namespace} value={namespace} />
      ))}
    </Select>
  );
};

export default ToolbarItemNamespaces;
