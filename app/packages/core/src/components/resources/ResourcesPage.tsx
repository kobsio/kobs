import { Refresh } from '@mui/icons-material';
import { Alert, AlertTitle, Box, Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { FormEvent, FunctionComponent, useState } from 'react';

import Resources from './Resources';
import { ResourcesSelectClusters } from './ResourcesSelectClusters';
import { ResourcesSelectNamespaces } from './ResourcesSelectNamespaces';
import { ResourcesSelectResources } from './ResourcesSelectResources';
import { IOptions } from './utils';

import { useQueryState } from '../../utils/hooks/useQueryState';
import { useUpdate } from '../../utils/hooks/useUpdate';
import { Page } from '../utils/Page';
import { Toolbar, ToolbarItem } from '../utils/Toolbar';

const ResourcesPage: FunctionComponent = () => {
  const update = useUpdate();
  const [options, setOptions] = useQueryState<IOptions>({
    clusters: [],
    namespaces: [],
    resources: [],
  });
  const [param, setParam] = useState<string>(options.param ?? '');

  /**
   * `handleSubmit` handles the submission of the toolbar form, when a user has entered a selector value.
   */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setOptions((prevOptions) => ({ ...prevOptions, param: param }));
  };

  return (
    <Page
      title="Kubernetes Resources"
      description="View and edit your Kubernetes resources. You can show your Kubernetes resources from different clusters and namespaces. You can also view the resources usage and logs of your Pod or get a shell into a Pod."
      toolbar={
        <Toolbar>
          <ToolbarItem width="250px">
            <ResourcesSelectClusters
              selectedClusters={options.clusters ?? []}
              selectClusters={(clusters) => setOptions((prevOptions) => ({ ...prevOptions, clusters: clusters }))}
            />
          </ToolbarItem>
          <ToolbarItem width="250px">
            <ResourcesSelectNamespaces
              selectedClusters={options.clusters ?? []}
              selectedNamespaces={options.namespaces ?? []}
              selectNamespaces={(namespaces) =>
                setOptions((prevOptions) => ({ ...prevOptions, namespaces: namespaces }))
              }
            />
          </ToolbarItem>
          <ToolbarItem width="250px">
            <ResourcesSelectResources
              selectedResources={options.resources ?? []}
              selectResources={(resources) => setOptions((prevOptions) => ({ ...prevOptions, resources: resources }))}
            />
          </ToolbarItem>
          <ToolbarItem width="200px">
            <FormControl sx={{ width: '200px' }} size="small">
              <InputLabel id="selector">Selector</InputLabel>
              <Select
                labelId="selector"
                value={options.paramName ?? ''}
                label="Selector"
                onChange={(e) => setOptions((prevOptions) => ({ ...prevOptions, paramName: e.target.value }))}
              >
                <MenuItem value="">No Selector</MenuItem>
                <MenuItem value="labelSelector">Label Selector</MenuItem>
                <MenuItem value="fieldSelector">Field Selector</MenuItem>
              </Select>
            </FormControl>
          </ToolbarItem>
          <ToolbarItem grow={true}>
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                size="small"
                variant="outlined"
                fullWidth={true}
                placeholder={
                  options.paramName === 'labelSelector'
                    ? 'app=kobs'
                    : options.paramName === 'fieldSelector'
                    ? 'metadata.namespace=default'
                    : 'Choose a selector first'
                }
                disabled={!options.paramName}
                value={param}
                onChange={(e) => setParam(e.target.value)}
              />
            </Box>
          </ToolbarItem>
          <ToolbarItem>
            <Button variant="contained" color="primary" onClick={() => update()}>
              <Refresh />
            </Button>
          </ToolbarItem>
        </Toolbar>
      }
    >
      {!options.clusters || options.clusters.length === 0 || !options.resources || options.resources.length === 0 ? (
        <Alert severity="info">
          <AlertTitle>Select a cluster and resource</AlertTitle>
          You have to select at least one cluster and Kubernetes resource in the toolbar.
        </Alert>
      ) : (options.paramName === 'labelSelector' || options.paramName === 'fieldSelector') &&
        (!options.param || options.param === '') ? (
        <Alert severity="info">
          <AlertTitle>Enter a selector</AlertTitle>
          If the <b>Label Selector</b> or <b>Field Selector</b> is selected, you have to enter a selector.
        </Alert>
      ) : (
        <Resources
          options={options}
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

export default ResourcesPage;
