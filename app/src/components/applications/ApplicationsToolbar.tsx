import {
  Button,
  ButtonVariant,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import React, { useContext, useState } from 'react';
import FilterIcon from '@patternfly/react-icons/dist/js/icons/filter-icon';
import SearchIcon from '@patternfly/react-icons/dist/js/icons/search-icon';

import { ClustersContext, IClusterContext } from 'context/ClustersContext';
import { IScope } from 'components/applications/Applications';
import ToolbarItemClusters from 'components/resources/ToolbarItemClusters';
import ToolbarItemNamespaces from 'components/resources/ToolbarItemNamespaces';

interface IApplicationsToolbarProps {
  setScope: (scope: IScope) => void;
}

// ApplicationsToolbar is the toolbar, where the user can select a list of clusters and namespaces. When the user clicks
// the search button the setScope function is called with the list of selected clusters and namespaces.
const ApplicationsToolbar: React.FunctionComponent<IApplicationsToolbarProps> = ({
  setScope,
}: IApplicationsToolbarProps) => {
  const clustersContext = useContext<IClusterContext>(ClustersContext);
  const [selectedClusters, setSelectedClusters] = useState<string[]>([clustersContext.clusters[0]]);
  const [selectedNamespaces, setSelectedNamespaces] = useState<string[]>([]);

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
              <ToolbarItemClusters
                clusters={clustersContext.clusters}
                selectedClusters={selectedClusters}
                selectCluster={selectCluster}
              />
            </ToolbarItem>
            <ToolbarItem>
              <ToolbarItemNamespaces
                selectedClusters={selectedClusters}
                selectedNamespaces={selectedNamespaces}
                selectNamespace={selectNamespace}
              />
            </ToolbarItem>
            <ToolbarItem>
              <Button
                variant={ButtonVariant.primary}
                icon={<SearchIcon />}
                onClick={(): void =>
                  setScope({
                    clusters: selectedClusters,
                    namespaces: selectedNamespaces,
                  })
                }
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

export default ApplicationsToolbar;
