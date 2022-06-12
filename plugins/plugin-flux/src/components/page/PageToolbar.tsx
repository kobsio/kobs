import {
  Button,
  ButtonVariant,
  ToggleGroup,
  ToggleGroupItem,
  ToolbarContent,
  ToolbarGroup,
  ToolbarGroupVariant,
  ToolbarItem,
} from '@patternfly/react-core';
import React, { useState } from 'react';
import { SearchIcon } from '@patternfly/react-icons';

import { IOptions, TType } from '../../utils/interfaces';
import { IPluginInstance } from '@kobsio/shared';
import PageToolbarItemClusters from './PageToolbarItemClusters';
import PageToolbarItemNamespaces from './PageToolbarItemNamespaces';
import { resources } from '../../utils/constants';

interface IPageToolbarProps {
  instance: IPluginInstance;
  options: IOptions;
  setOptions: (data: IOptions) => void;
}

const PageToolbar: React.FunctionComponent<IPageToolbarProps> = ({
  instance,
  options,
  setOptions,
}: IPageToolbarProps) => {
  const [state, setState] = useState<IOptions>(options);

  const selectCluster = (cluster: string): void => {
    setState({ ...state, cluster: cluster });
  };

  const selectNamespace = (namespace: string): void => {
    setState({ ...state, namespace: namespace });
  };

  const selectType = (type: TType): void => {
    setState({ ...state, type: type });
  };

  const changeOptions = (): void => {
    setOptions(state);
  };

  return (
    <ToolbarContent>
      <ToolbarGroup variant={ToolbarGroupVariant['filter-group']}>
        <ToolbarItem>
          <PageToolbarItemClusters instance={instance} selectedCluster={state.cluster} selectCluster={selectCluster} />
        </ToolbarItem>
        <ToolbarItem>
          <PageToolbarItemNamespaces
            instance={instance}
            selectedCluster={state.cluster}
            selectedNamespace={state.namespace}
            selectNamespace={selectNamespace}
          />
        </ToolbarItem>
      </ToolbarGroup>
      <ToolbarItem>
        <ToggleGroup aria-label="Type">
          <ToggleGroupItem
            className="pf-u-text-nowrap"
            text={resources['kustomizations'].title}
            isSelected={state.type === 'kustomizations'}
            onChange={(): void => selectType('kustomizations')}
          />
          <ToggleGroupItem
            className="pf-u-text-nowrap"
            text={resources['helmreleases'].title}
            isSelected={state.type === 'helmreleases'}
            onChange={(): void => selectType('helmreleases')}
          />
          <ToggleGroupItem
            className="pf-u-text-nowrap"
            text={resources['gitrepositories'].title}
            isSelected={state.type === 'gitrepositories'}
            onChange={(): void => selectType('gitrepositories')}
          />
          <ToggleGroupItem
            className="pf-u-text-nowrap"
            text={resources['helmrepositories'].title}
            isSelected={state.type === 'helmrepositories'}
            onChange={(): void => selectType('helmrepositories')}
          />
          <ToggleGroupItem
            className="pf-u-text-nowrap"
            text={resources['buckets'].title}
            isSelected={state.type === 'buckets'}
            onChange={(): void => selectType('buckets')}
          />
        </ToggleGroup>
      </ToolbarItem>
      <ToolbarItem>
        <Button variant={ButtonVariant.primary} icon={<SearchIcon />} onClick={changeOptions}>
          Search
        </Button>
      </ToolbarItem>
    </ToolbarContent>
  );
};

export default PageToolbar;
