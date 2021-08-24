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
import { IOptions, TType } from '../../utils/interfaces';
import PageToolbarItemClusters from './PageToolbarItemClusters';

interface IPageToolbarProps {
  options: IOptions;
  setOptions: (type: TType, cluster: string) => void;
}

const PageToolbar: React.FunctionComponent<IPageToolbarProps> = ({ options, setOptions }: IPageToolbarProps) => {
  const clustersContext = useContext<IClusterContext>(ClustersContext);
  const [selectedType, setSelectedType] = useState<TType>(options.type || 'sources');
  const [selectedCluster, setSelectedCluster] = useState<string>(options.cluster || clustersContext.clusters[0]);

  return (
    <Toolbar id="flux-toolbar" style={{ paddingBottom: '0px', zIndex: 300 }}>
      <ToolbarContent style={{ padding: '0px' }}>
        <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="lg">
          <ToolbarGroup>
            <ToolbarItem>
              <PageToolbarItemClusters
                clusters={clustersContext.clusters}
                selectedCluster={selectedCluster}
                selectCluster={(value: string): void => setSelectedCluster(value)}
              />
            </ToolbarItem>

            <ToolbarItem>
              <ToggleGroup aria-label="Type">
                <ToggleGroupItem
                  text="Sources"
                  isSelected={selectedType === 'sources'}
                  onChange={(): void => setSelectedType('sources')}
                />
                <ToggleGroupItem
                  text="Kustomizations"
                  isSelected={selectedType === 'kustomizations'}
                  onChange={(): void => setSelectedType('kustomizations')}
                />
                <ToggleGroupItem
                  text="Helm Releases"
                  isSelected={selectedType === 'helmreleases'}
                  onChange={(): void => setSelectedType('helmreleases')}
                />
              </ToggleGroup>
            </ToolbarItem>

            <ToolbarItem>
              <Button
                variant={ButtonVariant.primary}
                icon={<SearchIcon />}
                onClick={(): void => setOptions(selectedType, selectedCluster)}
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

export default memo(PageToolbar, (prevProps, nextProps) => {
  if (JSON.stringify(prevProps) === JSON.stringify(nextProps)) {
    return true;
  }

  return false;
});
