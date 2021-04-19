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

import { ClustersContext, IClusterContext } from 'context/ClustersContext';
import { IResources } from 'components/resources/Resources';
import ToolbarItemClusters from 'components/resources/ToolbarItemClusters';
import ToolbarItemNamespaces from 'components/resources/ToolbarItemNamespaces';
import ToolbarItemResources from 'components/resources/ToolbarItemResources';

interface IResourcesToolbarProps {
  resources: IResources;
  setResources: (resources: IResources) => void;
}

// ResourcesToolbar is the toolbar where the user can select a list of clusters, namespaces and resource. When the user
// clicks the search button the setResources function is called with the selected clusters, namespaces and resources.
const ResourcesToolbar: React.FunctionComponent<IResourcesToolbarProps> = ({
  resources,
  setResources,
}: IResourcesToolbarProps) => {
  const initialResources = resources.resources.length === 1 ? resources.resources[0] : undefined;
  const clustersContext = useContext<IClusterContext>(ClustersContext);
  const [selectedClusters, setSelectedClusters] = useState<string[]>(
    resources.clusters.length > 0 ? resources.clusters : [clustersContext.clusters[0]],
  );
  const [selectedResources, setSelectedResources] = useState<string[]>(
    initialResources ? initialResources.kindsList : [],
  );
  const [selectedNamespaces, setSelectedNamespaces] = useState<string[]>(
    initialResources ? initialResources.namespacesList : [],
  );

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
              <ToolbarItemClusters
                clusters={clustersContext.clusters}
                selectedClusters={selectedClusters}
                selectCluster={selectCluster}
              />
            </ToolbarItem>
            {clustersContext.resources ? (
              <ToolbarItem>
                <ToolbarItemResources
                  resources={clustersContext.resources}
                  selectedResources={selectedResources}
                  selectResource={selectResource}
                />
              </ToolbarItem>
            ) : null}
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
                  setResources({
                    clusters: selectedClusters,
                    resources: [{ kindsList: selectedResources, namespacesList: selectedNamespaces, selector: '' }],
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

export default ResourcesToolbar;
