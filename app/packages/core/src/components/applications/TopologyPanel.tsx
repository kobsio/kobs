import { Box } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext, useState } from 'react';

import { ApplicationsInsightsWrapper, TopologyGraph } from './Topology';
import { ITopology } from './utils';

import { APIContext, APIError, IAPIContext } from '../../context/APIContext';
import { GridContext, IGridContext } from '../../context/GridContext';
import { PluginPanel, PluginPanelError } from '../utils/PluginPanel';
import { UseQueryWrapper } from '../utils/UseQueryWrapper';

/**
 * `ITopologyPanelInternalProps` is the interface for the `TopologyPanelInternal` component.
 */
interface ITopologyPanelInternalProps {
  cluster: string;
  name: string;
  namespace: string;
}

/**
 * The `TopologyPanelInternal` component can be used to render the topology graph for a single application identified by the
 * provided `cluster`, `namespace`, `name` in a dashboard panel. If the data was loaded we show the topology graph. If
 * we are not able to load the data we use the `UseQueryWrapper` component to handle all types of errors.
 *
 * The `selectedApplicationID` state is used to show the insights of an application, which can be selected by a user by
 * clicking on the corresponding node in the topology graph.
 */
const TopologyPanelInternal: FunctionComponent<ITopologyPanelInternalProps> = ({ cluster, namespace, name }) => {
  const [selectedApplicationID, setSelectedApplicationID] = useState<string>();
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<ITopology, APIError>(
    ['core/applications/topology/application', cluster, namespace, name],
    async () => {
      return apiContext.client.get<ITopology>(
        `/api/applications/topology/application?id=${encodeURIComponent(
          `/cluster/${cluster}/namespace/${namespace}/name/${name}`,
        )}`,
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
      noDataTitle="No topology data was found"
      noDataMessage="No topology data was found for the provided application."
      refetch={refetch}
    >
      <Box sx={{ display: 'flex', flexGrow: 1, minHeight: '100%' }}>
        <TopologyGraph
          edges={data?.edges ?? []}
          nodes={data?.nodes ?? []}
          selectApplication={setSelectedApplicationID}
        />
      </Box>

      <ApplicationsInsightsWrapper
        id={selectedApplicationID}
        open={selectedApplicationID !== undefined}
        onClose={() => setSelectedApplicationID(undefined)}
      />
    </UseQueryWrapper>
  );
};

interface ITopologyPanelProps {
  description?: string;
  options?: {
    cluster?: string;
    name?: string;
    namespace?: string;
  };
  title: string;
}

/**
 * The `TopologyPanel` component is responsible for rendering a topology graph in a dashboard. The data for the topology
 * graph is loaded via the `TopologyPanelInternal` component. Here we are only validating the provided options to show
 * an example if an required property is missing.
 */
const TopologyPanel: FunctionComponent<ITopologyPanelProps> = ({ title, description, options }) => {
  const gridContext = useContext<IGridContext>(GridContext);

  if (options && options.cluster && options.namespace && options.name) {
    return (
      <PluginPanel title={title} description={description}>
        {gridContext.autoHeight ? (
          <Box height="300px">
            <TopologyPanelInternal cluster={options.cluster} namespace={options.namespace} name={options.name} />
          </Box>
        ) : (
          <TopologyPanelInternal cluster={options.cluster} namespace={options.namespace} name={options.name} />
        )}
      </PluginPanel>
    );
  }

  return (
    <PluginPanelError
      title={title}
      description={description}
      message="Invalid options for topology plugin"
      details="One of the required options: cluster, namespace or name is missing"
      example={`plugin:
  name: topology
  type: core
  options:
    cluster: "<% $.cluster %>"
    namespace: "<% $.namespace %>"
    name: "<% $.name %>"`}
      documentation="https://kobs.io/main/plugins/#topology"
    />
  );
};

export default TopologyPanel;
