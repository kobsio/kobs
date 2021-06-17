import React, { useState } from 'react';
import { Select, SelectOption, SelectVariant } from '@patternfly/react-core';

interface IToolbarItemClustersProps {
  clusters: string[];
  selectedClusters: string[];
  selectCluster: (cluster: string) => void;
}

// ToolbarItemClusters lets the user select a list of clusters.
const ToolbarItemClusters: React.FunctionComponent<IToolbarItemClustersProps> = ({
  clusters,
  selectedClusters,
  selectCluster,
}: IToolbarItemClustersProps) => {
  const [showOptions, setShowOptions] = useState<boolean>(false);

  return (
    <Select
      variant={SelectVariant.typeaheadMulti}
      typeAheadAriaLabel="Select clusters"
      placeholderText="Select clusters"
      onToggle={(): void => setShowOptions(!showOptions)}
      onSelect={(e, value): void => selectCluster(value as string)}
      onClear={(): void => selectCluster('')}
      selections={selectedClusters}
      isOpen={showOptions}
    >
      {clusters.map((cluster, index) => (
        <SelectOption key={index} value={cluster} />
      ))}
    </Select>
  );
};

export default ToolbarItemClusters;
