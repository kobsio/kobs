import React, { useState } from 'react';
import { Select, SelectGroup, SelectOption, SelectOptionObject, SelectVariant } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';

import { ICluster, IClusters } from '../../resources/clusters';

interface IResourcesToolbarClustersProps {
  selectedClusterIDs: string[];
  selectClusterID: (clusterID: string) => void;
}

const ResourcesToolbarClusters: React.FunctionComponent<IResourcesToolbarClustersProps> = ({
  selectedClusterIDs,
  selectClusterID,
}: IResourcesToolbarClustersProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { data } = useQuery<IClusters, Error>(['app/clusters'], async () => {
    const response = await fetch(`/api/clusters`, {
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

  const filter = (
    e: React.ChangeEvent<HTMLInputElement> | null,
    value: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): React.ReactElement<any, string | React.JSXElementConstructor<any>>[] => {
    if (data && Object.keys(data).length > 0 && value) {
      const clusters: React.ReactElement[] = [];
      const satellites = Object.keys(data);

      for (const satellite of satellites) {
        const filteredClusters = data[satellite].filter((cluster) =>
          cluster.cluster.toLowerCase().includes(value.toLowerCase()),
        );
        if (filteredClusters.length > 0) {
          clusters.push(
            <SelectGroup label={satellite} key={satellite}>
              {filteredClusters.map((cluster: ICluster) => (
                <SelectOption key={cluster.id} value={cluster.id}>
                  {cluster.cluster}
                </SelectOption>
              ))}
            </SelectGroup>,
          );
        }
      }

      return clusters;
    } else if (data && Object.keys(data).length > 0) {
      return Object.keys(data).map((satellite) => (
        <SelectGroup label={satellite} key={satellite}>
          {data[satellite].map((cluster: ICluster) => (
            <SelectOption key={cluster.id} value={cluster.id}>
              {cluster.cluster}
            </SelectOption>
          ))}
        </SelectGroup>
      ));
    } else {
      return [<SelectOption key="noresultsfound" value="No results found" isDisabled={true} />];
    }
  };

  return (
    <Select
      variant={SelectVariant.checkbox}
      aria-label="Select clusters input"
      placeholderText="Clusters"
      onToggle={(): void => setIsOpen(!isOpen)}
      onSelect={(
        event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
        value: string | SelectOptionObject,
      ): void => selectClusterID(value.toString())}
      onClear={(): void => selectClusterID('')}
      onFilter={filter}
      selections={selectedClusterIDs}
      isOpen={isOpen}
      isGrouped={true}
      hasInlineFilter={true}
      maxHeight="50vh"
    >
      {data && Object.keys(data).length > 0
        ? Object.keys(data).map((satellite) => (
            <SelectGroup label={satellite} key={satellite}>
              {data[satellite].map((cluster: ICluster) => (
                <SelectOption key={cluster.id} value={cluster.id}>
                  {cluster.cluster}
                </SelectOption>
              ))}
            </SelectGroup>
          ))
        : [<SelectOption key="noresultsfound" value="No results found" isDisabled={true} />]}
    </Select>
  );
};

export default ResourcesToolbarClusters;
