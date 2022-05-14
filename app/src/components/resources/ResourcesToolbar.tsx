import {
  Button,
  ButtonVariant,
  ToolbarContent,
  ToolbarGroup,
  ToolbarGroupVariant,
  ToolbarItem,
} from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { SearchIcon } from '@patternfly/react-icons';

import { IOptions } from './utils/interfaces';
import ResourcesToolbarClusters from './ResourcesToolbarClusters';
import ResourcesToolbarFilter from './ResourcesToolbarFilter';
import ResourcesToolbarNamespaces from './ResourcesToolbarNamespaces';
import ResourcesToolbarResources from './ResourcesToolbarResources';

interface IResourcesToolbarProps {
  options: IOptions;
  setOptions: (data: IOptions) => void;
}

const ResourcesToolbar: React.FunctionComponent<IResourcesToolbarProps> = ({
  options,
  setOptions,
}: IResourcesToolbarProps) => {
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

  const selectNamespaceID = (namespaceID: string): void => {
    if (namespaceID === '') {
      setState({ ...state, namespaceIDs: [] });
    } else {
      if (state.namespaceIDs.includes(namespaceID)) {
        setState({ ...state, namespaceIDs: state.namespaceIDs.filter((item) => item !== namespaceID) });
      } else {
        setState({ ...state, namespaceIDs: [...state.namespaceIDs, namespaceID] });
      }
    }
  };

  const selectResourceID = (resourceID: string): void => {
    if (resourceID === '') {
      setState({ ...state, resourceIDs: [] });
    } else {
      if (state.resourceIDs.includes(resourceID)) {
        setState({ ...state, resourceIDs: state.resourceIDs.filter((item) => item !== resourceID) });
      } else {
        setState({ ...state, resourceIDs: [...state.resourceIDs, resourceID] });
      }
    }
  };

  const changeOptions = (): void => {
    setOptions({
      ...state,
      times: {
        time: 'last15Minutes',
        timeEnd: Math.floor(Date.now() / 1000),
        timeStart: Math.floor(Date.now() / 1000) - 900,
      },
    });
  };

  useEffect(() => {
    setState(options);
  }, [options]);

  return (
    <ToolbarContent>
      <ToolbarGroup variant={ToolbarGroupVariant['filter-group']}>
        <ToolbarItem>
          <ResourcesToolbarClusters selectedClusterIDs={state.clusterIDs} selectClusterID={selectClusterID} />
        </ToolbarItem>
        <ToolbarItem>
          <ResourcesToolbarNamespaces
            selectedClusterIDs={state.clusterIDs}
            selectedNamespaceIDs={state.namespaceIDs}
            selectNamespaceID={selectNamespaceID}
          />
        </ToolbarItem>
        <ToolbarItem>
          <ResourcesToolbarResources selectedResourcesIDs={state.resourceIDs} selectResourceID={selectResourceID} />
        </ToolbarItem>
      </ToolbarGroup>
      <ResourcesToolbarFilter
        paramName={state.paramName}
        param={state.param}
        setParamName={(value: string): void => setState({ ...state, paramName: value })}
        setParam={(value: string): void => setState({ ...state, param: value })}
      />
      <ToolbarItem>
        <Button variant={ButtonVariant.primary} icon={<SearchIcon />} onClick={changeOptions}>
          Search
        </Button>
      </ToolbarItem>
    </ToolbarContent>
  );
};

export default ResourcesToolbar;
