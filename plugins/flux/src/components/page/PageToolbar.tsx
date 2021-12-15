import React, { memo, useContext, useState } from 'react';
import { ToggleGroup, ToggleGroupItem, ToolbarItem } from '@patternfly/react-core';

import { ClustersContext, IClusterContext, IOptionsAdditionalFields, IPluginTimes, Toolbar } from '@kobsio/plugin-core';
import { IOptions, TType } from '../../utils/interfaces';
import PageToolbarItemClusters from './PageToolbarItemClusters';

interface IPageToolbarProps {
  options: IOptions;
  setOptions: (options: IOptions) => void;
}

const PageToolbar: React.FunctionComponent<IPageToolbarProps> = ({ options, setOptions }: IPageToolbarProps) => {
  const clustersContext = useContext<IClusterContext>(ClustersContext);
  const [selectedType, setSelectedType] = useState<TType>(options.type || 'sources');
  const [selectedCluster, setSelectedCluster] = useState<string>(options.cluster || clustersContext.clusters[0]);

  // changeOptions changes the Prometheus option. It is used when the user clicks the search button or selects a new
  // time range.
  const changeOptions = (times: IPluginTimes, additionalFields: IOptionsAdditionalFields[] | undefined): void => {
    setOptions({ cluster: selectedCluster, times: times, type: selectedType });
  };

  return (
    <Toolbar times={options.times} showOptions={false} showSearchButton={true} setOptions={changeOptions}>
      <ToolbarItem style={{ width: '100%' }}>
        <PageToolbarItemClusters
          clusters={clustersContext.clusters}
          selectedCluster={selectedCluster}
          selectCluster={(value: string): void => setSelectedCluster(value)}
        />
      </ToolbarItem>

      <ToolbarItem>
        <ToggleGroup aria-label="Type">
          <ToggleGroupItem
            className="pf-u-text-nowrap"
            text="Sources"
            isSelected={selectedType === 'sources'}
            onChange={(): void => setSelectedType('sources')}
          />
          <ToggleGroupItem
            className="pf-u-text-nowrap"
            text="Kustomizations"
            isSelected={selectedType === 'kustomizations'}
            onChange={(): void => setSelectedType('kustomizations')}
          />
          <ToggleGroupItem
            className="pf-u-text-nowrap"
            text="Helm Releases"
            isSelected={selectedType === 'helmreleases'}
            onChange={(): void => setSelectedType('helmreleases')}
          />
        </ToggleGroup>
      </ToolbarItem>
    </Toolbar>
  );
};

export default memo(PageToolbar, (prevProps, nextProps) => {
  if (JSON.stringify(prevProps) === JSON.stringify(nextProps)) {
    return true;
  }

  return false;
});
