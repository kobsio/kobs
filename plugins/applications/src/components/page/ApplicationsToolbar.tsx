import {
  Button,
  ButtonVariant,
  ToggleGroup,
  ToggleGroupItem,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import { FilterIcon, SearchIcon } from '@patternfly/react-icons';
import React, { memo, useContext, useState } from 'react';

import { ClustersContext, IClusterContext } from '@kobsio/plugin-core';
import ApplicationsToolbarItemClusters from './ApplicationsToolbarItemClusters';
import ApplicationsToolbarItemNamespaces from './ApplicationsToolbarItemNamespaces';
import { TView } from '../../utils/interfaces';

interface IApplicationsToolbarProps {
  clusters: string[];
  namespaces: string[];
  view: string;
  changeData: (clusters: string[], namespaces: string[], view: string) => void;
}

// ApplicationsToolbar is the toolbar, where the user can select a list of clusters and namespaces. When the user clicks
// the search button the setScope function is called with the list of selected clusters and namespaces.
const ApplicationsToolbar: React.FunctionComponent<IApplicationsToolbarProps> = ({
  clusters,
  namespaces,
  view,
  changeData,
}: IApplicationsToolbarProps) => {
  const clustersContext = useContext<IClusterContext>(ClustersContext);
  const [selectedClusters, setSelectedClusters] = useState<string[]>(
    clusters.length > 0 ? clusters : [clustersContext.clusters[0]],
  );
  const [selectedNamespaces, setSelectedNamespaces] = useState<string[]>(namespaces);
  const [selectedView, setSelectedView] = useState<TView>(view ? (view as TView) : 'gallery');

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

  return (
    <Toolbar id="applications-toolbar" style={{ paddingBottom: '0px', zIndex: 300 }}>
      <ToolbarContent style={{ padding: '0px' }}>
        <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="lg">
          <ToolbarGroup>
            <ToolbarItem>
              <ApplicationsToolbarItemClusters
                clusters={clustersContext.clusters}
                selectedClusters={selectedClusters}
                selectCluster={selectCluster}
              />
            </ToolbarItem>
            <ToolbarItem>
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
            <ToolbarItem>
              <Button
                variant={ButtonVariant.primary}
                icon={<SearchIcon />}
                onClick={(): void => changeData(selectedClusters, selectedNamespaces, selectedView)}
              >
                Search
              </Button>
            </ToolbarItem>
          </ToolbarGroup>
        </ToolbarToggleGroup>
      </ToolbarContent>
    </Toolbar>
  );
};

export default memo(ApplicationsToolbar, (prevProps, nextProps) => {
  if (JSON.stringify(prevProps) === JSON.stringify(nextProps)) {
    return true;
  }

  return false;
});
