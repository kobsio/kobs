import React, { useState } from 'react';
import { Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import { IResources } from '@kobsio/plugin-core';

interface IToolbarItemResourcesProps {
  resources: IResources;
  selectedResources: string[];
  selectResource: (resource: string) => void;
}

// ToolbarItemResources lets the user select a list of resources.
const ToolbarItemResources: React.FunctionComponent<IToolbarItemResourcesProps> = ({
  resources,
  selectedResources,
  selectResource,
}: IToolbarItemResourcesProps) => {
  const [showOptions, setShowOptions] = useState<boolean>(false);

  return (
    <Select
      variant={SelectVariant.typeaheadMulti}
      typeAheadAriaLabel="Select resources"
      placeholderText="Select resources"
      onToggle={(): void => setShowOptions(!showOptions)}
      onSelect={(e, value): void => selectResource(value as string)}
      onClear={(): void => selectResource('')}
      selections={selectedResources}
      isOpen={showOptions}
      onFilter={(e: React.ChangeEvent<HTMLInputElement> | null, value: string): React.ReactElement[] =>
        Object.keys(resources)
          .filter((key) => !value || key.includes(value))
          .map((key) => (
            <SelectOption
              key={key}
              value={key}
              description={resources[key].isCRD ? `${resources[key].resource}.${resources[key].path}` : undefined}
            >
              {resources[key].title}
            </SelectOption>
          ))
      }
    >
      {Object.keys(resources).map((key) => (
        <SelectOption
          key={key}
          value={key}
          description={resources[key].isCRD ? `${resources[key].resource}.${resources[key].path}` : undefined}
        >
          {resources[key].title}
        </SelectOption>
      ))}
    </Select>
  );
};

export default ToolbarItemResources;
