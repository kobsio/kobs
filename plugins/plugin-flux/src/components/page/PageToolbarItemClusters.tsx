import React, { useState } from 'react';
import { Select, SelectOption, SelectOptionObject, SelectVariant } from '@patternfly/react-core';
import { useQuery } from 'react-query';

import { IPluginInstance } from '@kobsio/shared';

interface IPageToolbarItemClustersProps {
  instance: IPluginInstance;
  selectedCluster: string;
  selectCluster: (cluster: string) => void;
}

const PageToolbarItemClusters: React.FunctionComponent<IPageToolbarItemClustersProps> = ({
  instance,
  selectedCluster,
  selectCluster,
}: IPageToolbarItemClustersProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { data } = useQuery<string[], Error>(['flux/clusters', instance], async () => {
    const response = await fetch(`/api/plugins/flux/clusters`, {
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
      aria-label="Select cluster input"
      placeholderText="Cluster"
      onToggle={(): void => setIsOpen(!isOpen)}
      onSelect={(
        event: React.MouseEvent<Element, MouseEvent> | React.ChangeEvent<Element>,
        value: string | SelectOptionObject,
      ): void => selectCluster(value.toString())}
      onClear={(): void => selectCluster('')}
      onFilter={(e: React.ChangeEvent<HTMLInputElement> | null, value: string): React.ReactElement[] =>
        data
          ? data
              .filter((cluster) => !value || cluster.includes(value))
              .map((cluster: string) => (
                <SelectOption key={cluster} value={cluster}>
                  {cluster}
                </SelectOption>
              ))
          : []
      }
      selections={selectedCluster}
      isOpen={isOpen}
      hasInlineFilter={true}
      maxHeight="50vh"
    >
      {data && data.length > 0
        ? data.map((cluster) => (
            <SelectOption key={cluster} value={cluster}>
              {cluster}
            </SelectOption>
          ))
        : [<SelectOption key="noresultsfound" value="No results found" isDisabled={true} />]}
    </Select>
  );
};

export default PageToolbarItemClusters;
