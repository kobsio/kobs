import React, { useState } from 'react';
import { Select, SelectOption, SelectVariant } from '@patternfly/react-core';

interface IToolbarItemClustersProps {
  clusters: string[];
  selectedCluster: string;
  selectCluster: (cluster: string) => void;
}

// ToolbarItemClusters lets the user select a list of clusters.
const ToolbarItemClusters: React.FunctionComponent<IToolbarItemClustersProps> = ({
  clusters,
  selectedCluster,
  selectCluster,
}: IToolbarItemClustersProps) => {
  const [showOptions, setShowOptions] = useState<boolean>(false);

  return (
    <Select
      variant={SelectVariant.typeahead}
      typeAheadAriaLabel="Select cluster"
      placeholderText="Select cluster"
      onToggle={(): void => setShowOptions(!showOptions)}
      onSelect={(e, value): void => selectCluster(value as string)}
      onClear={(): void => selectCluster('')}
      selections={selectedCluster}
      isOpen={showOptions}
      onFilter={(e: React.ChangeEvent<HTMLInputElement> | null, value: string): React.ReactElement[] =>
        clusters
          .filter((c) => !value || c.includes(value))
          .map((cluster: string) => <SelectOption key={cluster} value={cluster} />)
      }
    >
      {clusters.map((cluster, index) => (
        <SelectOption key={index} value={cluster} />
      ))}
    </Select>
  );
};

export default ToolbarItemClusters;
