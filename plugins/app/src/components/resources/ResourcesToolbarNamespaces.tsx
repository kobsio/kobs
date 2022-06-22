import React, { useState } from 'react';
import { Select, SelectOption, SelectOptionObject, SelectVariant } from '@patternfly/react-core';
import { useQuery } from 'react-query';

interface IResourcesToolbarNamespacesProps {
  selectedClusterIDs: string[];
  selectedNamespaces: string[];
  selectNamespace: (namespace: string) => void;
}

const ResourcesToolbarNamespaces: React.FunctionComponent<IResourcesToolbarNamespacesProps> = ({
  selectedClusterIDs,
  selectedNamespaces,
  selectNamespace,
}: IResourcesToolbarNamespacesProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { data } = useQuery<string[], Error>(['app/clusters/namespaces', selectedClusterIDs], async () => {
    const c = selectedClusterIDs.map((clusterID) => `&clusterID=${encodeURIComponent(clusterID)}`);

    const response = await fetch(`/api/clusters/namespaces?${c.length > 0 ? c.join('') : ''}`, {
      method: 'get',
    });
    const json = await response.json();

    if (response.status >= 200 && response.status < 300) {
      return json;
    } else {
      if (json.error) {
        throw new Error(json.error);
      } else {
        throw new Error('An unknown error occured');
      }
    }
  });

  return (
    <Select
      variant={SelectVariant.checkbox}
      aria-label="Select namespaces input"
      placeholderText="Namespaces"
      onToggle={(): void => setIsOpen(!isOpen)}
      onSelect={(
        event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
        value: string | SelectOptionObject,
      ): void => selectNamespace(value.toString())}
      onClear={(): void => selectNamespace('')}
      selections={selectedNamespaces}
      isOpen={isOpen}
      hasInlineFilter={true}
      maxHeight="50vh"
    >
      {data && data.length > 0
        ? data.map((namespace) => (
            <SelectOption key={namespace} value={namespace}>
              {namespace}
            </SelectOption>
          ))
        : [<SelectOption key="noresultsfound" value="No results found" isDisabled={true} />]}
    </Select>
  );
};

export default ResourcesToolbarNamespaces;
