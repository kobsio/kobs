import React, { useState } from 'react';
import { Select, SelectOption, SelectOptionObject, SelectVariant } from '@patternfly/react-core';
import { useQuery } from 'react-query';

import { IPluginInstance } from '@kobsio/shared';

interface IResourcesToolbarNamespacesProps {
  instance: IPluginInstance;
  selectedClusters: string[];
  selectedNamespaces: string[];
  selectNamespace: (namespace: string) => void;
}

const ResourcesToolbarNamespaces: React.FunctionComponent<IResourcesToolbarNamespacesProps> = ({
  instance,
  selectedClusters,
  selectedNamespaces,
  selectNamespace,
}: IResourcesToolbarNamespacesProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { data } = useQuery<string[], Error>(['helm/namespaces', instance, selectedClusters], async () => {
    const c = selectedClusters.map((cluster) => `&cluster=${encodeURIComponent(cluster)}`);

    const response = await fetch(`/api/plugins/helm/namespaces?${c.length > 0 ? c.join('') : ''}`, {
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'x-kobs-plugin': instance.name,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'x-kobs-satellite': instance.satellite,
      },
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
      isGrouped={true}
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
