import React, { memo, useContext, useState } from 'react';
import { ToolbarItem } from '@patternfly/react-core';

import { ClustersContext, IClusterContext, IOptionsAdditionalFields, IPluginTimes, Toolbar } from '@kobsio/plugin-core';
import { IOptions } from '../../utils/interfaces';
import PageToolbarItemClusters from './PageToolbarItemClusters';
import PageToolbarItemNamespaces from './PageToolbarItemNamespaces';

interface IPageToolbarProps {
  options: IOptions;
  setOptions: (options: IOptions) => void;
}

const PageToolbar: React.FunctionComponent<IPageToolbarProps> = ({ options, setOptions }: IPageToolbarProps) => {
  const clustersContext = useContext<IClusterContext>(ClustersContext);
  const [selectedClusters, setSelectedClusters] = useState<string[]>(
    options.clusters.length === 0
      ? clustersContext.clusters.length === 0
        ? []
        : [clustersContext.clusters[0]]
      : options.clusters,
  );
  const [selectedNamespaces, setSelectedNamespaces] = useState<string[]>(options.namespaces);

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
    setOptions({
      clusters: selectedClusters,
      namespaces: selectedNamespaces,
      times: times,
    });
  };

  return (
    <Toolbar times={options.times} showOptions={false} showSearchButton={true} setOptions={changeOptions}>
      <ToolbarItem style={{ width: '100%' }}>
        <ToolbarItem style={{ width: '100%' }}>
          <PageToolbarItemClusters
            clusters={clustersContext.clusters}
            selectedClusters={selectedClusters}
            selectCluster={selectCluster}
          />
        </ToolbarItem>
        <ToolbarItem style={{ width: '100%' }}>
          <PageToolbarItemNamespaces
            selectedClusters={selectedClusters}
            selectedNamespaces={selectedNamespaces}
            selectNamespace={selectNamespace}
          />
        </ToolbarItem>
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
