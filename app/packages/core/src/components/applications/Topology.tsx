import { Box, Button, Theme, useTheme, darken } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import nodeHtmlLabel from 'cytoscape-node-html-label';
import { FunctionComponent, useCallback, useContext, useEffect, useRef, useState } from 'react';

import ApplicationInsights from './ApplicationsInsights';
import { IApplicationOptions, IEdge, INode, INodeData, ITopology } from './utils';

import { APIContext, APIError, IAPIContext } from '../../context/APIContext';
import { IApplication } from '../../crds/application';
import { useDimensions } from '../../utils/hooks/useDimensions';
import UseQueryWrapper from '../utils/UseQueryWrapper';

/**
 * `dagreLayout` is the layout for the topology graph.
 * See: https://js.cytoscape.org/#layouts
 */
const dagreLayout = {
  fit: true,
  name: 'dagre',
  nodeDimensionsIncludeLabels: true,
  rankDir: 'LR',
};

/**
 * `nodeLabel` is the layout of a single node in our topology graph. Since we can not use MUI components within the node
 * label we have to style the node labels via css classes.
 */
const nodeLabel = (node: INodeData): string => {
  return `<div class="kobsio-applications-topology-label">
      <div>
        <span><strong>Name:</strong></span>
        <span>${node.name}</span>
      </div>
      <div>
        <span><strong>Namespace:</strong></span>
        <span>${node.namespace}</span>
      </div>
      <div>
        <span><strong>Cluster:</strong></span>
        <span>${node.cluster}</span>
      </div>

      ${
        node.external &&
        `
      <div>
        <span><strong>External:</strong></span>
        <span>True</span>
      </div>
        `
      }
    </div>`;
};

/**
 * `styleSheet` changes the style of the nodes and edges in the topology graph. To style the nodes and edges we pass our
 * theme to the function, so that the style fits the overall MUI theme.
 * See: https://js.cytoscape.org/#style
 */
const styleSheet = (theme: Theme): cytoscape.Stylesheet[] => [
  {
    selector: 'node',
    style: {
      'background-color': theme.palette.background.paper,
      'border-color': darken(theme.palette.background.paper, 0.13),
      'border-opacity': 1,
      'border-width': 1,
      color: '#151515',
      'font-family': theme.typography.fontFamily,
      height: '120px',
      label: 'data(id)',
      shape: 'roundrectangle',
      'text-halign': 'center',
      'text-opacity': 0,
      'text-valign': 'bottom',
      'text-wrap': 'wrap',
      width: '220px',
    },
  },
  {
    selector: 'edge',
    style: {
      'curve-style': 'bezier',
      'line-color': theme.palette.primary.main,
      'target-arrow-color': theme.palette.primary.main,
      'target-arrow-shape': 'triangle',
      width: 3,
    },
  },
];

/**
 * `ITopologyGraphProps` is the interface for the `TopologyGraph` component.
 */
interface ITopologyGraphProps {
  edges: IEdge[];
  nodes: INode[];
  selectApplication: (id: string) => void;
}

/**
 * The `TopologyGraph` renders the topology graph via cytoscape. The topology graph is rendered for the provided `edges`
 * and `nodes`.
 *
 * The `selectApplication` is triggered when a user clicks on a node in the topology graph to display the applications
 * insights for this node.
 */
const TopologyGraph: FunctionComponent<ITopologyGraphProps> = ({ edges, nodes, selectApplication }) => {
  const theme = useTheme();
  const wrapper = useRef<HTMLDivElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const graph = useRef<cytoscape.Core>();
  const layout = useRef<cytoscape.Layouts>();
  const size = useDimensions(wrapper);

  const onTap = useCallback(
    (event: cytoscape.EventObject): void => {
      const node = event.target;
      const data: INodeData = node.data();

      if (data.id) {
        selectApplication(data.id);
      }
    },
    [selectApplication],
  );

  useEffect(() => {
    setTimeout(() => {
      if (graph.current) {
        if (layout.current) {
          layout.current.stop();
        }

        graph.current.add({
          edges: edges,
          nodes: nodes,
        });

        layout.current = graph.current.elements().makeLayout(dagreLayout);
        layout.current.run();
      }
    }, 100);
  }, [edges, nodes, size]);

  useEffect(() => {
    if (!container.current) {
      return;
    }

    try {
      if (!graph.current) {
        cytoscape.use(dagre);
        nodeHtmlLabel(cytoscape);

        graph.current = cytoscape({
          container: container.current,
          style: styleSheet(theme),
        });
        graph.current.on('tap', onTap);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (graph.current as any).nodeHtmlLabel([
          {
            halign: 'center',
            halignBox: 'center',
            query: 'node:visible',
            tpl: nodeLabel,
            valign: 'center',
            valignBox: 'center',
          },
        ]);
      }
    } catch (err) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size]);

  useEffect(() => {
    return (): void => {
      if (graph.current) {
        graph.current.removeListener('tab', onTap);
        graph.current.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box minWidth="100%" sx={{ flexGrow: 1 }} ref={wrapper}>
      {size.height > 0 && size.width > 0 ? (
        <Box
          sx={{
            '.kobsio-applications-topology-label': {
              maxHeight: '100px',
              maxWidth: '200px',
              overflow: 'hidden',
              textAlign: 'left',
              whiteSpace: 'wrap',
            },
            height: `${size.height}px`,
            width: `${size.width}px`,
          }}
          ref={container}
        />
      ) : null}
    </Box>
  );
};

/**
 * `IApplicationsInsightsWrapperProps` is the interface for the `ApplicationsInsightsWrapper` component.
 */
interface IApplicationsInsightsWrapperProps {
  id?: string;
  onClose: () => void;
  open: boolean;
}

/**
 * The `ApplicationsInsightsWrapper` is a wrapper component around the `ApplicationsInsights` component and responsible
 * for loading the application with the provided `id`. The loaded application will then be used to display the insights
 * in a drawer via the `ApplicationsInsights` component.
 */
const ApplicationsInsightsWrapper: FunctionComponent<IApplicationsInsightsWrapperProps> = ({ id, open, onClose }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { data } = useQuery<IApplication | undefined, APIError>(['core/applications/application', id], async () => {
    if (id) {
      return apiContext.client.get<IApplication>(`/api/applications/application?id=${encodeURIComponent(id)}`);
    }
    return undefined;
  });

  if (!data) {
    return null;
  }

  return <ApplicationInsights application={data} open={open} onClose={onClose} />;
};

/**
 * `ITopologyProps` is the interface for the `Topology` component.
 */
interface ITopologyProps {
  options: IApplicationOptions;
  setOptions: (options: IApplicationOptions) => void;
}

/**
 * The `Topology` component is responsible for loading the data for the topology graph based on the provided options. If
 * the data was loaded we show the topology graph. If we are not able to load the data we use the `UseQueryWrapper`
 * component to handle all types of errors.
 *
 * The `selectedApplicationID` state is used to show the insights of an application, which can be selected by a user by
 * clicking on the corresponding node in the topology graph.
 */
const Topology: FunctionComponent<ITopologyProps> = ({ options, setOptions }) => {
  const [selectedApplicationID, setSelectedApplicationID] = useState<string>();
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<ITopology, APIError>(
    ['core/applications/topology', options],
    async () => {
      const c = options.clusters?.map((cluster) => `&cluster=${encodeURIComponent(cluster)}`);
      const n = options.namespaces?.map((namespace) => `&namespace=${encodeURIComponent(namespace)}`);
      const t = options.tags?.map((tag) => `&tag=${encodeURIComponent(tag)}`);

      return apiContext.client.get<ITopology>(
        `/api/applications/topology?all=${options.all}&searchTerm=${options.searchTerm}${
          c && c.length > 0 ? c.join('') : ''
        }${n && n.length > 0 ? n.join('') : ''}${t && t.length > 0 ? t.join('') : ''}`,
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

export default Topology;
