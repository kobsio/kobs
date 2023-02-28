import { Alert, AlertTitle } from '@mui/material';
import { FunctionComponent } from 'react';

import ApplicationsToolbar from './ApplicationsToolbar';
import Topology from './Topology';
import { IApplicationOptions } from './utils';

import useQueryState from '../../utils/hooks/useQueryState';
import Page from '../utils/Page';

/**
 * The `TopologyPage` component can be used to render a topology graph within a React Router route. The topology graph
 * can be filtered by the same options as the applications on the `ApplicationsPage`.
 */
const TopologyPage: FunctionComponent = () => {
  const [options, setOptions] = useQueryState<IApplicationOptions>({
    all: false,
    clusters: [],
    namespaces: [],
    page: undefined,
    perPage: undefined,
    searchTerm: '',
    tags: [],
  });

  return (
    <Page
      title="Topology"
      description="A topology graph of your / all applications. You can filter the graph by clusters, namespaces or tags."
      toolbar={<ApplicationsToolbar options={options} setOptions={setOptions} />}
    >
      {!options.clusters || options.clusters.length === 0 ? (
        <Alert severity="info">
          <AlertTitle>Select a cluster</AlertTitle>
          You have to select at least one cluster to get the topology graph.
        </Alert>
      ) : (
        <Topology options={options} setOptions={setOptions} />
      )}
    </Page>
  );
};

export default TopologyPage;
