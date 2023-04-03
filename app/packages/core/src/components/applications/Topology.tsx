import { Box, Theme, useTheme, darken } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import nodeHtmlLabel from 'cytoscape-node-html-label';
import { FunctionComponent, useCallback, useContext, useEffect, useRef } from 'react';

import ApplicationInsights from './ApplicationsInsights';
import { IEdge, INode, INodeData } from './utils';

import { APIContext, APIError, IAPIContext } from '../../context/APIContext';
import { IApplication } from '../../crds/application';
import { useDimensions } from '../../utils/hooks/useDimensions';

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
export const TopologyGraph: FunctionComponent<ITopologyGraphProps> = ({ edges, nodes, selectApplication }) => {
  const theme = useTheme();
  const wrapper = useRef<HTMLDivElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const graph = useRef<cytoscape.Core>();
  const layout = useRef<cytoscape.Layouts>();
  const size = useDimensions(wrapper);

  const onTap = useCallback(
    (e: cytoscape.EventObject): void => {
      const node = e.target;
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
    } catch {}
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
export const ApplicationsInsightsWrapper: FunctionComponent<IApplicationsInsightsWrapperProps> = ({
  id,
  open,
  onClose,
}) => {
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
