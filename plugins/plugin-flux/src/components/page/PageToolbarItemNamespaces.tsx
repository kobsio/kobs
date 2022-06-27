import React, { useState } from 'react';
import { Select, SelectOption, SelectOptionObject, SelectVariant } from '@patternfly/react-core';
import { useQuery } from 'react-query';

import { IPluginInstance } from '@kobsio/shared';

interface IResourcesToolbarNamespacesProps {
  instance: IPluginInstance;
  selectedCluster: string;
  selectedNamespace: string;
  selectNamespace: (namespace: string) => void;
}

const ResourcesToolbarNamespaces: React.FunctionComponent<IResourcesToolbarNamespacesProps> = ({
  instance,
  selectedCluster,
  selectedNamespace,
  selectNamespace,
}: IResourcesToolbarNamespacesProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { data } = useQuery<string[], Error>(['flux/namespaces', instance, selectedCluster], async () => {
    const response = await fetch(`/api/plugins/flux/namespaces?&cluster=${encodeURIComponent(selectedCluster)}`, {
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
      variant={SelectVariant.typeahead}
      aria-label="Select namespace input"
      placeholderText="Namespace"
      onToggle={(): void => setIsOpen(!isOpen)}
      onSelect={(
        event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
        value: string | SelectOptionObject,
      ): void => selectNamespace(value.toString())}
      onClear={(): void => selectNamespace('')}
      onFilter={(e: React.ChangeEvent<HTMLInputElement> | null, value: string): React.ReactElement[] =>
        data
          ? data
              .filter((namespace) => !value || namespace.includes(value))
              .map((namespace: string) => (
                <SelectOption key={namespace} value={namespace}>
                  {namespace}
                </SelectOption>
              ))
          : []
      }
      selections={selectedNamespace}
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
