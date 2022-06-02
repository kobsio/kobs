import React, { useState } from 'react';
import { Select, SelectGroup, SelectOption, SelectOptionObject, SelectVariant } from '@patternfly/react-core';
import { useQuery } from 'react-query';

import { INamespace, INamespaces } from '../../resources/clusters';

interface IResourcesToolbarNamespacesProps {
  selectedClusterIDs: string[];
  selectedNamespaceIDs: string[];
  selectNamespaceID: (clusterIDs: string) => void;
}

const ResourcesToolbarNamespaces: React.FunctionComponent<IResourcesToolbarNamespacesProps> = ({
  selectedClusterIDs,
  selectedNamespaceIDs,
  selectNamespaceID,
}: IResourcesToolbarNamespacesProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { data } = useQuery<INamespaces, Error>(['app/clusters/namespaces', selectedClusterIDs], async () => {
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
      ): void => selectNamespaceID(value.toString())}
      onClear={(): void => selectNamespaceID('')}
      selections={selectedNamespaceIDs}
      isOpen={isOpen}
      isGrouped={true}
      hasInlineFilter={true}
      maxHeight="50vh"
    >
      {data && Object.keys(data).length > 0
        ? Object.keys(data).map((cluster) => (
            <SelectGroup label={cluster} key={cluster}>
              {data[cluster].map((namespace: INamespace) => (
                <SelectOption key={namespace.id} value={namespace.id}>
                  {namespace.namespace}
                </SelectOption>
              ))}
            </SelectGroup>
          ))
        : [<SelectOption key="noresultsfound" value="No results found" isDisabled={true} />]}
    </Select>
  );
};

export default ResourcesToolbarNamespaces;
