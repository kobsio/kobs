import { Alert, AlertTitle, Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext, useState } from 'react';

import ApplicationsToolbar from './ApplicationsToolbar';
import { ApplicationsInsightsWrapper, TopologyGraph } from './Topology';
import { IApplicationOptions, ITopology } from './utils';

import { APIContext, APIError, IAPIContext } from '../../context/APIContext';
import { useQueryState } from '../../utils/hooks/useQueryState';
import { Page } from '../utils/Page';
import { UseQueryWrapper } from '../utils/UseQueryWrapper';

/**
 * `ITopologyÜageInternalProps` is the interface for the `Topology` component.
 */
interface ITopologyÜageInternalProps {
  options: IApplicationOptions;
  setOptions: (options: IApplicationOptions) => void;
}

/**
 * The `TopologyInternal` component is responsible for loading the data for the topology graph based on the provided
 * options. If the data was loaded we show the topology graph. If we are not able to load the data we use the
 * `UseQueryWrapper` component to handle all types of errors.
 *
 * The `selectedApplicationID` state is used to show the insights of an application, which can be selected by a user by
 * clicking on the corresponding node in the topology graph.
 */
const TopologyInternal: FunctionComponent<ITopologyÜageInternalProps> = ({ options, setOptions }) => {
  const [selectedApplicationID, setSelectedApplicationID] = useState<string>();
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<ITopology, APIError>(
    ['core/applications/topology', options],
    async () => {
      const join = (v: string[] | undefined): string => (v && v.length > 0 ? v.join('') : '');

      const c = join(options.clusters?.map((cluster) => `&cluster=${encodeURIComponent(cluster)}`));
      const n = join(options.namespaces?.map((namespace) => `&namespace=${encodeURIComponent(namespace)}`));
      const t = join(options.tags?.map((tag) => `&tag=${encodeURIComponent(tag)}`));

      return apiContext.client.get<ITopology>(
        `/api/applications/topology?all=${options.all}&searchTerm=${options.searchTerm}${c}${n}${t}`,
      );
    },
  );

  return (
    <UseQueryWrapper
      error={error}
      errorTitle="Failed to load topology data"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data || !data.nodes || data.nodes.length === 0 || !data.edges || data.edges.length === 0}
      noDataActions={
        options.all ? undefined : (
          <Button color="inherit" size="small" onClick={() => setOptions({ ...options, all: true })}>
            RETRY WITH ALL
          </Button>
        )
      }
      noDataTitle="No topology data was found"
      noDataMessage={
        options.all
          ? 'No topology data was found for your selected filters.'
          : 'No topology data was found for your selected filters. You can try to search through all applications to generate the topology data.'
      }
      refetch={refetch}
    >
      <TopologyGraph edges={data?.edges ?? []} nodes={data?.nodes ?? []} selectApplication={setSelectedApplicationID} />

      <ApplicationsInsightsWrapper
        id={selectedApplicationID}
        open={selectedApplicationID !== undefined}
        onClose={() => setSelectedApplicationID(undefined)}
      />
    </UseQueryWrapper>
  );
};

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
        <TopologyInternal options={options} setOptions={setOptions} />
      )}
    </Page>
  );
};

export default TopologyPage;
