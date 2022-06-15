import {
  Button,
  ButtonVariant,
  SearchInput,
  ToggleGroup,
  ToggleGroupItem,
  ToolbarContent,
  ToolbarGroup,
  ToolbarGroupVariant,
  ToolbarItem,
  ToolbarItemVariant,
} from '@patternfly/react-core';
import React, { useState } from 'react';
import { SearchIcon } from '@patternfly/react-icons';

import ApplicationsToolbarTags from './ApplicationsToolbarTags';
import { IOptions } from './utils/interfaces';
import ResourcesToolbarClusters from '../resources/ResourcesToolbarClusters';
import ResourcesToolbarNamespaces from '../resources/ResourcesToolbarNamespaces';

interface IApplicationsToolbarProps {
  options: IOptions;
  setOptions: (data: IOptions) => void;
}

const ApplicationsToolbar: React.FunctionComponent<IApplicationsToolbarProps> = ({
  options,
  setOptions,
}: IApplicationsToolbarProps) => {
  const [state, setState] = useState<IOptions>(options);

  const selectClusterID = (clusterID: string): void => {
    if (clusterID === '') {
      setState({ ...state, clusterIDs: [] });
    } else {
      if (state.clusterIDs.includes(clusterID)) {
        setState({ ...state, clusterIDs: state.clusterIDs.filter((item) => item !== clusterID) });
      } else {
        setState({ ...state, clusterIDs: [...state.clusterIDs, clusterID] });
      }
    }
  };

  const selectNamespace = (namespace: string): void => {
    if (namespace === '') {
      setState({ ...state, namespaces: [] });
    } else {
      if (state.namespaces.includes(namespace)) {
        setState({ ...state, namespaces: state.namespaces.filter((item) => item !== namespace) });
      } else {
        setState({ ...state, namespaces: [...state.namespaces, namespace] });
      }
    }
  };

  const selectTag = (tag: string): void => {
    if (tag === '') {
      setState({ ...state, tags: [] });
    } else {
      if (state.tags.includes(tag)) {
        setState({ ...state, tags: state.tags.filter((item) => item !== tag) });
      } else {
        setState({ ...state, tags: [...state.tags, tag] });
      }
    }
  };

  const changeOptions = (): void => {
    setOptions({ ...state, page: 1, perPage: 10 });
  };

  return (
    <ToolbarContent>
      <ToolbarGroup variant={ToolbarGroupVariant['filter-group']}>
        <ToolbarItem>
          <ToggleGroup aria-label="Select owned or all teams">
            <ToggleGroupItem
              text="Owned"
              isSelected={state.all === false}
              onChange={(): void => setState({ ...state, all: false })}
            />
            <ToggleGroupItem
              text="All"
              isSelected={state.all === true}
              onChange={(): void => setState({ ...state, all: true })}
            />
          </ToggleGroup>
        </ToolbarItem>
      </ToolbarGroup>
      <ToolbarItem variant={ToolbarItemVariant['search-filter']}>
        <SearchInput
          aria-label="Search team input"
          value={state.searchTerm}
          onChange={(value: string): void => setState({ ...state, searchTerm: value })}
          onClear={(): void => setState({ ...state, searchTerm: '' })}
        />
      </ToolbarItem>
      <ToolbarGroup variant={ToolbarGroupVariant['filter-group']}>
        <ToolbarItem>
          <ResourcesToolbarClusters selectedClusterIDs={state.clusterIDs} selectClusterID={selectClusterID} />
        </ToolbarItem>
        <ToolbarItem>
          <ResourcesToolbarNamespaces
            selectedClusterIDs={state.clusterIDs}
            selectedNamespaces={state.namespaces}
            selectNamespace={selectNamespace}
          />
        </ToolbarItem>
        <ToolbarItem>
          <ApplicationsToolbarTags selectedTags={state.tags} selectTag={selectTag} />
        </ToolbarItem>
      </ToolbarGroup>
      <ToolbarGroup variant={ToolbarGroupVariant['filter-group']}>
        <ToolbarItem variant={ToolbarItemVariant.label} id="external-applications">
          External Applications
        </ToolbarItem>
        <ToolbarItem>
          <ToggleGroup aria-label="Select how to handle external applications" aria-labelledby="external-applications">
            <ToggleGroupItem
              text="Include"
              isSelected={state.external === 'include'}
              onChange={(): void => setState({ ...state, external: 'include' })}
            />
            <ToggleGroupItem
              text="Exclude"
              isSelected={state.external === 'exclude'}
              onChange={(): void => setState({ ...state, external: 'exclude' })}
            />
            <ToggleGroupItem
              text="Only"
              isSelected={state.external === 'only'}
              onChange={(): void => setState({ ...state, external: 'only' })}
            />
          </ToggleGroup>
        </ToolbarItem>
      </ToolbarGroup>
      <ToolbarItem>
        <Button variant={ButtonVariant.primary} icon={<SearchIcon />} onClick={changeOptions}>
          Search
        </Button>
      </ToolbarItem>
    </ToolbarContent>
  );
};

export default ApplicationsToolbar;
