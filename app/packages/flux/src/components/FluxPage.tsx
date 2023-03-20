import {
  IPluginPageProps,
  Page,
  ResourcesSelectClusters,
  ResourcesSelectNamespaces,
  Toolbar,
  ToolbarItem,
  useLocalStorageState,
  useQueryState,
  useUpdate,
} from '@kobsio/core';
import { Refresh } from '@mui/icons-material';
import { Alert, AlertTitle, Button, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { FunctionComponent, useEffect } from 'react';

import Resources from './Resources';

import { description, TFluxType } from '../utils/utils';

/**
 * `IOptions` are the options which can be set by a user to get a list of FLux resources. The `param` and `paramName`
 * can not be set be a user, but are required to show a specific Flux resource for anotherone (e.g. the Git repository
 * for a Kustomization).
 */
interface IOptions {
  clusters: string[];
  namespaces: string[];
  param: string;
  paramName: string;
  type: TFluxType;
}

/**
 * The `FluxPage` component is used as plugin page within the Flux plugin. The user can select a list of clusters,
 * namespaces and the Flux resource type for which he wants to view all CRs.
 */
const FluxPage: FunctionComponent<IPluginPageProps> = ({ instance }) => {
  const update = useUpdate();
  const [persistedOptions, setPersistedOptions] = useLocalStorageState<IOptions>('kobs-flux-fluxpage-options', {
    clusters: [],
    namespaces: [],
    param: '',
    paramName: '',
    type: 'kustomizations',
  });
  const [options, setOptions] = useQueryState<IOptions>(persistedOptions);

  /**
   * `useEffect` is used to persist the options, when they are changed by a user.
   */
  useEffect(() => {
    setPersistedOptions(options);
  }, [options, setPersistedOptions]);

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
              selectClusters={(clusters) => setOptions({ ...options, clusters: clusters, param: '', paramName: '' })}
            />
          </ToolbarItem>
          <ToolbarItem grow={true} width="250px">
            <ResourcesSelectNamespaces
              selectedClusters={options.clusters ?? []}
              selectedNamespaces={options.namespaces ?? []}
              selectNamespaces={(namespaces) =>
                setOptions({ ...options, namespaces: namespaces, param: '', paramName: '' })
              }
            />
          </ToolbarItem>
          <ToolbarItem>
            <ToggleButtonGroup
              size="small"
              value={options.type}
              exclusive={true}
              onChange={(_, value) => setOptions({ ...options, param: '', paramName: '', type: value })}
            >
              <ToggleButton sx={{ px: 4 }} value="kustomizations">
                Kustomizations
              </ToggleButton>
              <ToggleButton sx={{ px: 4 }} value="helmreleases">
                Helm Releases
              </ToggleButton>
              <ToggleButton sx={{ px: 4 }} value="gitrepositories">
                Git Repositories
              </ToggleButton>
              <ToggleButton sx={{ px: 4 }} value="helmrepositories">
                Helm Repositories
              </ToggleButton>
              <ToggleButton sx={{ px: 4 }} value="buckets">
                Buckets
              </ToggleButton>
            </ToggleButtonGroup>
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
        <Resources
          instance={instance}
          clusters={options.clusters}
          namespaces={options.namespaces}
          resource={options.type}
          paramName={options.paramName}
          param={options.param}
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

export default FluxPage;
