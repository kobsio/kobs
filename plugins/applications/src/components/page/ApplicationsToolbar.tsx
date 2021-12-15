import React, { memo, useContext, useState } from 'react';
import { ToggleGroup, ToggleGroupItem, ToolbarItem } from '@patternfly/react-core';

import { ClustersContext, IClusterContext, IOptionsAdditionalFields, IPluginTimes, Toolbar } from '@kobsio/plugin-core';
import { IOptions, TView } from '../../utils/interfaces';
import ApplicationsToolbarItemClusters from './ApplicationsToolbarItemClusters';
import ApplicationsToolbarItemNamespaces from './ApplicationsToolbarItemNamespaces';

interface IApplicationsToolbarProps {
  options: IOptions;
  setOptions: (data: IOptions) => void;
}

// ApplicationsToolbar is the toolbar, where the user can select a list of clusters and namespaces. When the user clicks
// the search button the setScope function is called with the list of selected clusters and namespaces.
const ApplicationsToolbar: React.FunctionComponent<IApplicationsToolbarProps> = ({
  options,
  setOptions,
}: IApplicationsToolbarProps) => {
  const clustersContext = useContext<IClusterContext>(ClustersContext);
  const [selectedClusters, setSelectedClusters] = useState<string[]>(
    options.clusters.length > 0 ? options.clusters : [clustersContext.clusters[0]],
  );
  const [selectedNamespaces, setSelectedNamespaces] = useState<string[]>(options.namespaces);
  const [selectedView, setSelectedView] = useState<TView>(options.view ? (options.view as TView) : 'gallery');

  // selectCluster adds/removes the given cluster to the list of selected clusters. When the cluster value is an empty
  // string the selected clusters list is cleared.
  const selectCluster = (cluster: string): void => {
    if (cluster === '') {
      setSelectedClusters([]);
    } else {
      if (selectedClusters.includes(cluster)) {
        setSelectedClusters(selectedClusters.filter((item) => item !== cluster));
      } else {
        setSelectedClusters([...selectedClusters, cluster]);
      }
    }
  };

  // selectNamespace adds/removes the given namespace to the list of selected namespaces. When the namespace value is an
  // empty string the selected namespaces list is cleared.
  const selectNamespace = (namespace: string): void => {
    if (namespace === '') {
      setSelectedNamespaces([]);
    } else {
      if (selectedNamespaces.includes(namespace)) {
        setSelectedNamespaces(selectedNamespaces.filter((item) => item !== namespace));
      } else {
        setSelectedNamespaces([...selectedNamespaces, namespace]);
      }
    }
  };

  // changeOptions changes the Prometheus option. It is used when the user clicks the search button or selects a new
  // time range.
  const changeOptions = (times: IPluginTimes, additionalFields: IOptionsAdditionalFields[] | undefined): void => {
    setOptions({ clusters: selectedClusters, namespaces: selectedNamespaces, times: times, view: selectedView });
  };

  return (
    <Toolbar times={options.times} showOptions={false} showSearchButton={true} setOptions={changeOptions}>
      <ToolbarItem style={{ width: '100%' }}>
        <ApplicationsToolbarItemClusters
          clusters={clustersContext.clusters}
          selectedClusters={selectedClusters}
          selectCluster={selectCluster}
        />
      </ToolbarItem>
      <ToolbarItem style={{ width: '100%' }}>
        <ApplicationsToolbarItemNamespaces
          selectedClusters={selectedClusters}
          selectedNamespaces={selectedNamespaces}
          selectNamespace={selectNamespace}
        />
      </ToolbarItem>
      <ToolbarItem>
        <ToggleGroup aria-label="View">
          <ToggleGroupItem
            text="Gallery"
            isSelected={selectedView === 'gallery'}
            onChange={(): void => setSelectedView('gallery')}
          />
          <ToggleGroupItem
            text="Topology"
            isSelected={selectedView === 'topology'}
            onChange={(): void => setSelectedView('topology')}
          />
        </ToggleGroup>
      </ToolbarItem>
    </Toolbar>
  );
};

export default memo(ApplicationsToolbar, (prevProps, nextProps) => {
  if (JSON.stringify(prevProps) === JSON.stringify(nextProps)) {
    return true;
  }

  return false;
});
