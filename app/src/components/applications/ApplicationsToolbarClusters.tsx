import React, { useState } from 'react';
import { Select, SelectGroup, SelectOption, SelectOptionObject, SelectVariant } from '@patternfly/react-core';
import { useQuery } from 'react-query';

import { ICluster, IClusters } from '../../resources/clusters';

interface IApplicationsToolbarClustersProps {
  selectedClusterIDs: string[];
  selectClusterID: (clusterIDs: string) => void;
}

const ApplicationsToolbarClusters: React.FunctionComponent<IApplicationsToolbarClustersProps> = ({
  selectedClusterIDs,
  selectClusterID,
}: IApplicationsToolbarClustersProps) => {
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

  return (
    <Select
      variant={SelectVariant.checkbox}
      aria-label="Select clusters input"
      placeholderText="Clusters"
      onToggle={(): void => setIsOpen(!isOpen)}
      // eslint-disable-next-line @typescript-eslint/naming-convention
      onSelect={(_, value: string | SelectOptionObject): void => selectClusterID(value.toString())}
      onClear={(): void => selectClusterID('')}
      selections={selectedClusterIDs}
      isOpen={isOpen}
      isGrouped={true}
      hasInlineFilter={true}
      maxHeight="50vh"
    >
      {data
        ? Object.keys(data).map((satellite) => (
            <SelectGroup label={satellite} key={satellite}>
              {data[satellite].map((cluster: ICluster) => (
                <SelectOption key={cluster.id} value={cluster.id}>
                  {cluster.cluster}
                </SelectOption>
              ))}
            </SelectGroup>
          ))
        : []}
    </Select>
  );
};

export default ApplicationsToolbarClusters;
