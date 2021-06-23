import {
  Button,
  ButtonVariant,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import { FilterIcon, SearchIcon } from '@patternfly/react-icons';
import React, { useContext, useState } from 'react';

import { ClustersContext, IClusterContext } from '@kobsio/plugin-core';
import { IPanelOptions } from '../../utils/utils';
import PageToolbarItemClusters from './PageToolbarItemClusters';
import PageToolbarItemNamespaces from './PageToolbarItemNamespaces';
import PageToolbarItemResources from './PageToolbarItemResources';

interface IPageToolbarProps {
  resources: IPanelOptions;
  setResources: (clusters: string[], namespaces: string[], resources: string[], selector: string) => void;
}

const PageToolbar: React.FunctionComponent<IPageToolbarProps> = ({ resources, setResources }: IPageToolbarProps) => {
  const clustersContext = useContext<IClusterContext>(ClustersContext);
  const [selectedClusters, setSelectedClusters] = useState<string[]>(
    resources.clusters.length === 0
      ? clustersContext.clusters.length === 0
        ? []
        : [clustersContext.clusters[0]]
      : resources.clusters,
  );
  const [selectedResources, setSelectedResources] = useState<string[]>(resources.resources);
  const [selectedNamespaces, setSelectedNamespaces] = useState<string[]>(resources.namespaces);

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

  // selectResource adds/removes the given resource to the list of selected resources. When the resource value is an
  // empty string the selected resources list is cleared.
  const selectResource = (resource: string): void => {
    if (resource === '') {
      setSelectedResources([]);
    } else {
      if (selectedResources.includes(resource)) {
        setSelectedResources(selectedResources.filter((item) => item !== resource));
      } else {
        setSelectedResources([...selectedResources, resource]);
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
    <Toolbar id="resources-toolbar" style={{ paddingBottom: '0px', zIndex: 300 }}>
      <ToolbarContent style={{ padding: '0px' }}>
        <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="lg">
          <ToolbarGroup>
            <ToolbarItem>
              <PageToolbarItemClusters
                clusters={clustersContext.clusters}
                selectedClusters={selectedClusters}
                selectCluster={selectCluster}
              />
            </ToolbarItem>
            {clustersContext.resources ? (
              <ToolbarItem>
                <PageToolbarItemResources
                  resources={clustersContext.resources}
                  selectedResources={selectedResources}
                  selectResource={selectResource}
                />
              </ToolbarItem>
            ) : null}
            <ToolbarItem>
              <PageToolbarItemNamespaces
                selectedClusters={selectedClusters}
                selectedNamespaces={selectedNamespaces}
                selectNamespace={selectNamespace}
              />
            </ToolbarItem>
            <ToolbarItem>
              <Button
                variant={ButtonVariant.primary}
                icon={<SearchIcon />}
                onClick={(): void => setResources(selectedClusters, selectedNamespaces, selectedResources, '')}
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

export default PageToolbar;
