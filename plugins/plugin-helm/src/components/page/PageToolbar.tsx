import React, { useState } from 'react';

import { IOptionsAdditionalFields, IPluginInstance, ITimes, Options, Toolbar, ToolbarItem } from '@kobsio/shared';
import { IOptions } from '../../utils/interfaces';
import PageToolbarItemClusters from './PageToolbarItemClusters';
import PageToolbarItemNamespaces from './PageToolbarItemNamespaces';

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
    if (cluster === '') {
      setState({ ...state, clusters: [] });
    } else {
      if (state.clusters.includes(cluster)) {
        setState({ ...state, clusters: state.clusters.filter((item) => item !== cluster) });
      } else {
        setState({ ...state, clusters: [...state.clusters, cluster] });
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

  const changeOptions = (times: ITimes, additionalFields: IOptionsAdditionalFields[] | undefined): void => {
    setOptions({ clusters: state.clusters, namespaces: state.namespaces, times: times });
  };

  return (
    <Toolbar usePageInsets={true}>
      <ToolbarItem grow={true}>
        <PageToolbarItemClusters instance={instance} selectedClusters={state.clusters} selectCluster={selectCluster} />
      </ToolbarItem>
      <ToolbarItem grow={true}>
        <PageToolbarItemNamespaces
          instance={instance}
          selectedClusters={state.clusters}
          selectedNamespaces={state.namespaces}
          selectNamespace={selectNamespace}
        />
      </ToolbarItem>

      <Options times={options.times} showOptions={false} showSearchButton={true} setOptions={changeOptions} />
    </Toolbar>
  );
};

export default PageToolbar;
