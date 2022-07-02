import React, { useState } from 'react';
import { Select, SelectOption, SelectOptionObject, SelectVariant } from '@patternfly/react-core';
import { useQuery } from 'react-query';

import { IResource } from '../../resources/clusters';

interface IResourcesToolbarNamespacesProps {
  selectedResourcesIDs: string[];
  selectResourceID: (resourceIDs: string) => void;
}

const ResourcesToolbarNamespaces: React.FunctionComponent<IResourcesToolbarNamespacesProps> = ({
  selectedResourcesIDs,
  selectResourceID,
}: IResourcesToolbarNamespacesProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { data } = useQuery<IResource[], Error>(['app/clusters/resources'], async () => {
    const response = await fetch(`/api/clusters/resources`, {
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
      aria-label="Select resources input"
      placeholderText="Resources"
      onToggle={(): void => setIsOpen(!isOpen)}
      onSelect={(
        event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
        value: string | SelectOptionObject,
      ): void => selectResourceID(value.toString())}
      onClear={(): void => selectResourceID('')}
      onFilter={(e: React.ChangeEvent<HTMLInputElement> | null, value: string): React.ReactElement[] =>
        data
          ? data
              .filter((resource) => !value || resource.id.toLowerCase().includes(value.toLowerCase()))
              .map((resource: IResource) => (
                <SelectOption
                  key={resource.id}
                  value={resource.id}
                  description={resource.isCRD ? resource.id : undefined}
                >
                  {resource.title}
                </SelectOption>
              ))
          : []
      }
      selections={selectedResourcesIDs}
      isOpen={isOpen}
      hasInlineFilter={true}
      maxHeight="50vh"
    >
      {data && data.length > 0
        ? data.map((resource) => (
            <SelectOption key={resource.id} value={resource.id} description={resource.isCRD ? resource.id : undefined}>
              {resource.title}
            </SelectOption>
          ))
        : [<SelectOption key="noresultsfound" value="No results found" isDisabled={true} />]}
    </Select>
  );
};

export default ResourcesToolbarNamespaces;
