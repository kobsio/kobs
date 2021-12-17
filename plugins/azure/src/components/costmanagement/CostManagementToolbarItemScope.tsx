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
  const options = resourceGroups;
  if (options.indexOf('All') === -1) {
    options.push('All');
  }

  return (
    <Select
      variant={SelectVariant.single}
      typeAheadAriaLabel="Select scope"
      placeholderText="Select scope"
      onToggle={(): void => setShowSelect(!showSelect)}
      onSelect={(e, value): void => setScope(value as string)}
      selections={scope}
      isOpen={showSelect}
    >
      {options.map((scope, index) => (
        <SelectOption key={index} value={scope} />
      ))}
    </Select>
  );
};

export default CostManagementToolbarItemScope;
