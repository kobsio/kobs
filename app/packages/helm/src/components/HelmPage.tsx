import {
  IPluginPageProps,
  Page,
  ResourcesSelectClusters,
  ResourcesSelectNamespaces,
  Toolbar,
  ToolbarItem,
  useQueryState,
  useUpdate,
} from '@kobsio/core';
import { Refresh } from '@mui/icons-material';
import { Alert, AlertTitle, Button } from '@mui/material';
import { FunctionComponent } from 'react';

import Releases from './Releases';

import { description } from '../utils/utils';

/**
 * `IOptions` is the interface for the options which can be selected by a user to show a list of Helm releases.
 */
interface IOptions {
  clusters: string[];
  namespaces: string[];
}

/**
 * The `HelmPage` component implementes the page interface for the Helm plugin. It can be used to show a list of Helm
 * releases from multiple clusters and namespaces. The clusters and namespaces can be selected by a user via the
 * toolbar.
 */
const HelmPage: FunctionComponent<IPluginPageProps> = ({ instance }) => {
  const update = useUpdate();
  const [options, setOptions] = useQueryState<IOptions>({
    clusters: [],
    namespaces: [],
  });

  return (
    <Page
      title={instance.name}
      subtitle={`(${instance.cluster} / ${instance.type})`}
      description={instance.description || description}
      toolbar={
        <Toolbar>
          <ToolbarItem grow={true} width="250px">
            <ResourcesSelectClusters
              selectedClusters={options.clusters ?? []}
              selectClusters={(clusters) => setOptions({ ...options, clusters: clusters })}
            />
          </ToolbarItem>
          <ToolbarItem grow={true} width="250px">
            <ResourcesSelectNamespaces
              selectedClusters={options.clusters ?? []}
              selectedNamespaces={options.namespaces ?? []}
              selectNamespaces={(namespaces) => setOptions({ ...options, namespaces: namespaces })}
            />
          </ToolbarItem>
          <ToolbarItem>
            <Button variant="contained" color="primary" onClick={() => update()}>
              <Refresh />
            </Button>
          </ToolbarItem>
        </Toolbar>
      }
    >
      {!options.clusters || options.clusters.length === 0 ? (
        <Alert severity="info">
          <AlertTitle>Select a cluster</AlertTitle>
          You have to select at least one cluster in the toolbar.
        </Alert>
      ) : (
        <Releases
          instance={instance}
          clusters={options.clusters}
          namespaces={options.namespaces}
          times={{
            time: 'last15Minutes',
            timeEnd: Math.floor(Date.now() / 1000),
            timeStart: Math.floor(Date.now() / 1000) - 900,
          }}
        />
      )}
    </Page>
  );
};

export default HelmPage;
