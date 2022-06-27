import React, { useState } from 'react';
import { Select, SelectOption, SelectVariant } from '@patternfly/react-core';

export interface ICostManagementToolbarItemScopeProps {
  scope: string;
  setScope: (scope: string) => void;
  resourceGroups: string[];
}

// CostManagementToolbarItemScope lets the user select the scope
const CostManagementToolbarItemScope: React.FunctionComponent<ICostManagementToolbarItemScopeProps> = ({
  scope,
  setScope,
  resourceGroups,
}: ICostManagementToolbarItemScopeProps) => {
  const [showSelect, setShowSelect] = useState<boolean>(false);

  const options = [<SelectOption key="All" value="All" />];
  resourceGroups.map((resourceGroup) => options.push(<SelectOption key={resourceGroup} value={resourceGroup} />));

  return (
    <Select
      variant={SelectVariant.typeahead}
      typeAheadAriaLabel="Select scope"
      placeholderText="Select scope"
      onToggle={(): void => setShowSelect(!showSelect)}
      onSelect={(e, value): void => setScope(value as string)}
      onFilter={(e: React.ChangeEvent<HTMLInputElement> | null, value: string): React.ReactElement[] =>
        resourceGroups
          .filter((resourceGroup) => !value || resourceGroup.includes(value))
          .map((resourceGroup: string) => <SelectOption key={resourceGroup} value={resourceGroup} />)
      }
      selections={scope}
      isOpen={showSelect}
      maxHeight="50vh"
    >
      {options}
    </Select>
  );
};

export default CostManagementToolbarItemScope;
