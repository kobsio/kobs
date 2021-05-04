import React, { useState } from 'react';
import { Select, SelectOption, SelectVariant } from '@patternfly/react-core';

interface IKialiPageToolbarNamespacesProps {
  namespaces: string[];
  selectedNamespaces: string[];
  selectNamespace: (namespace: string) => void;
}

// KialiPageToolbarNamespaces lets the user select a list of namespaces.
const KialiPageToolbarNamespaces: React.FunctionComponent<IKialiPageToolbarNamespacesProps> = ({
  namespaces,
  selectedNamespaces,
  selectNamespace,
}: IKialiPageToolbarNamespacesProps) => {
  const [showOptions, setShowOptions] = useState<boolean>(false);

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
        <SelectOption key={index} value={namespace} />
      ))}
    </Select>
  );
};

export default KialiPageToolbarNamespaces;
