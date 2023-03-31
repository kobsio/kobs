import {
  APIContext,
  APIError,
  IAPIContext,
  IPluginInstance,
  ITimes,
  useDimensions,
  UseQueryWrapper,
} from '@kobsio/core';
import { Box, darken, Theme, useTheme } from '@mui/material';
import { deepPurple, teal, blue } from '@mui/material/colors';
import { useQuery } from '@tanstack/react-query';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import nodeHtmlLabel from 'cytoscape-node-html-label';
import { FunctionComponent, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';

import { Edge } from './Edge';
import { Node } from './Node';

import { IEdgeWrapper, IGraph, INodeData, INodeWrapper } from '../utils/utils';

/**
 * dagreLayout is the layout for the topology graph.
 * See: https://js.cytoscape.org/#layouts
 */
const dagreLayout = {
  fit: true,
  name: 'dagre',
  nodeDimensionsIncludeLabels: true,
  rankDir: 'LR',
};

/**
 * styleSheet changes the style of the nodes and edges in the topology graph.
 * See: https://js.cytoscape.org/#style
 */
const styleSheet = (theme: Theme): cytoscape.Stylesheet[] => [
  {
    selector: 'node',
    style: {
      'background-color': theme.palette.background.paper,
      'background-fit': 'cover',
      'background-height': '80%',
      'background-image': 'data(nodeImage)',
      'background-position-x': '50%',
      'background-position-y': '50%',
      'background-width': '80%',
      'border-color': darken(theme.palette.background.paper, 0.13),
      'border-opacity': 1,
      'border-width': 1,
      color: theme.palette.text.primary,
      'font-family': theme.typography.fontFamily,
      // The label is only rendered, so that the generated html labels fit the nodes. We disable the default label, via
      // the text-opacity setting.
      label: 'data(nodeLabelFull)',
      'text-halign': 'center',
      'text-opacity': 0,
      'text-valign': 'bottom',
      'text-wrap': 'wrap',
    },
  },
  {
    selector: 'node[nodeType="box"]',
    style: {
      shape: 'roundrectangle',
    },
  },
  {
    selector: 'node[nodeType="app"]',
    style: {
      shape: 'roundrectangle',
    },
  },
  {
    selector: 'node[nodeType="service"]',
    style: {
      'background-position-y': '6px',
      shape: 'round-triangle',
    },
  },
  {
    selector: 'node[nodeType="serviceentry"]',
    style: {
      shape: 'round-tag',
    },
  },
  {
    selector: 'node[nodeType="unknown"]',
    style: {
      shape: 'ellipse',
    },
  },

  {
    selector: 'edge',
    style: {
      color: theme.palette.text.primary,
      'curve-style': 'bezier',
      'font-family': theme.typography.fontFamily,
      'font-size': 10,
      label: 'data(edgeLabel)',
      'line-color': darken(theme.palette.background.paper, 0.13),
      'target-arrow-color': darken(theme.palette.background.paper, 0.13),
      'target-arrow-shape': 'triangle',
      'text-wrap': 'wrap',
      width: 3,
    },
  },
  {
    selector: 'edge[edgeType="tcp"]',
    style: {
      'line-color': blue[500],
      'target-arrow-color': blue[500],
    },
  },
  {
    selector: 'edge[edgeType="grpc"]',
    style: {
      'line-color': teal[500],
      'target-arrow-color': teal[500],
    },
  },
  {
    selector: 'edge[edgeType="http"]',
    style: {
      'line-color': theme.palette.success.main,
      'target-arrow-color': theme.palette.success.main,
    },
  },
  {
    selector: 'edge[edgeType="httphealthy"]',
    style: {
      'line-color': theme.palette.success.main,
      'target-arrow-color': theme.palette.success.main,
    },
  },
  {
    selector: 'edge[edgeType="httpdegraded"]',
    style: {
      'line-color': theme.palette.warning.main,
      'target-arrow-color': theme.palette.warning.main,
    },
  },
  {
    selector: 'edge[edgeType="httpfailure"]',
    style: {
      'line-color': theme.palette.error.main,
      'target-arrow-color': theme.palette.error.main,
    },
  },
];

const nodeLabel = (theme: Theme, node: INodeData): string => {
  if (node.isBox) {
    return `<div class="kobsio-kiali-label boxed">
      <div class="kobsio-kiali-label-text boxed">
        <span class="pf-c-badge pf-m-unread kobsio-kiali-label-badge">A</span>
        ${node.nodeLabel}${node.isOutside ? `<br/>(${node.namespace})` : ''}
      </div>
    </div>`;
  }

  let icons = '';
  if (node.isGateway) {
    icons = `<svg viewBox="0 0 512 512" width="12" height="12" style="margin-right: 3px"><path fill="${theme.palette.text.primary}" d="M352 256c0 22.2-1.2 43.6-3.3 64H163.3c-2.2-20.4-3.3-41.8-3.3-64s1.2-43.6 3.3-64H348.7c2.2 20.4 3.3 41.8 3.3 64zm28.8-64H503.9c5.3 20.5 8.1 41.9 8.1 64s-2.8 43.5-8.1 64H380.8c2.1-20.6 3.2-42 3.2-64s-1.1-43.4-3.2-64zm112.6-32H376.7c-10-63.9-29.8-117.4-55.3-151.6c78.3 20.7 142 77.5 171.9 151.6zm-149.1 0H167.7c6.1-36.4 15.5-68.6 27-94.7c10.5-23.6 22.2-40.7 33.5-51.5C239.4 3.2 248.7 0 256 0s16.6 3.2 27.8 13.8c11.3 10.8 23 27.9 33.5 51.5c11.6 26 20.9 58.2 27 94.7zm-209 0H18.6C48.6 85.9 112.2 29.1 190.6 8.4C165.1 42.6 145.3 96.1 135.3 160zM8.1 192H131.2c-2.1 20.6-3.2 42-3.2 64s1.1 43.4 3.2 64H8.1C2.8 299.5 0 278.1 0 256s2.8-43.5 8.1-64zM194.7 446.6c-11.6-26-20.9-58.2-27-94.6H344.3c-6.1 36.4-15.5 68.6-27 94.6c-10.5 23.6-22.2 40.7-33.5 51.5C272.6 508.8 263.3 512 256 512s-16.6-3.2-27.8-13.8c-11.3-10.8-23-27.9-33.5-51.5zM135.3 352c10 63.9 29.8 117.4 55.3 151.6C112.2 482.9 48.6 426.1 18.6 352H135.3zm358.1 0c-30 74.1-93.6 130.9-171.9 151.6c25.5-34.2 45.2-87.7 55.3-151.6H493.4z"/></svg> ${icons}`;
  }
  if (node.isRoot) {
    icons = `<svg viewBox="0 0 512 512" width="12" height="12" style="margin-right: 3px"><path fill="${theme.palette.text.primary}" d="M256 8c137 0 248 111 248 248S393 504 256 504 8 393 8 256 119 8 256 8zM140 300h116v70.9c0 10.7 13 16.1 20.5 8.5l114.3-114.9c4.7-4.7 4.7-12.2 0-16.9l-114.3-115c-7.6-7.6-20.5-2.2-20.5 8.5V212H140c-6.6 0-12 5.4-12 12v64c0 6.6 5.4 12 12 12z"/></svg> ${icons}`;
  }
  if (node.hasMissingSC) {
    icons = `<svg viewBox="0 0 1024 1024" width="12" height="12" style="margin-right: 3px"><path fill="${theme.palette.text.primary}" d="M0,767.3 L0,640 L64,640 L64,752.3 C64,760.584271 70.7157288,767.3 79,767.3 L128,768.1 L128,832.1 L64,831.3 C28.6674863,831.266922 0.0330777378,802.632514 0,767.3 Z M64,0 L191.3,0 L191.3,64 L79,64 C70.7157288,64 64,70.7157288 64,79 L64,192 L0,192 L0,64 C0.0330777378,28.6674863 28.6674863,0.0330777378 64,0 Z M0,384 L64,384 L64,256 L0,256 L0,384 Z M0,576 L64,576 L64,448 L0,448 L0,576 Z M832,64.7 L832,128 L768,128 L768,79.7 C768,71.4157288 761.284271,64.7 753,64.7 L640,64.7 L640,0.7 L768,0.7 C803.332514,0.733077738 831.966922,29.3674863 832,64.7 Z M448,64.7 L576,64.7 L576,0.7 L448,0.7 L448,64.7 Z M256,64.7 L384,64.7 L384,0.7 L256,0.7 L256,64.7 Z M960,192 L256,192 C220.667486,192.033078 192.033078,220.667486 192,256 L192,960 C192.033078,995.332514 220.667486,1023.96692 256,1024 L960,1024 C995.332514,1023.96692 1023.96692,995.332514 1024,960 L1024,256 C1023.96692,220.667486 995.332514,192.033078 960,192 Z M960,945 C960,953.284271 953.284271,960 945,960 L271,960 C262.715729,960 256,953.284271 256,945 L256,271 C256,262.715729 262.715729,256 271,256 L945,256 C953.284271,256 960,262.715729 960,271 L960,945 Z"></path></svg> ${icons}`;
  }
  if (node.hasCB) {
    icons = `<svg viewBox="0 0 448 512" width="12" height="12" style="margin-right: 3px"><path fill="${theme.palette.text.primary}" d="M349.4 44.6c5.9-13.7 1.5-29.7-10.6-38.5s-28.6-8-39.9 1.8l-256 224c-10 8.8-13.6 22.9-8.9 35.3S50.7 288 64 288H175.5L98.6 467.4c-5.9 13.7-1.5 29.7 10.6 38.5s28.6 8 39.9-1.8l256-224c10-8.8 13.6-22.9 8.9-35.3s-16.6-20.7-30-20.7H272.5L349.4 44.6z"/></svg> ${icons}`;
  }
  if (node.hasRequestTimeout) {
    icons = `<svg viewBox="0 0 512 512" width="12" height="12" style="margin-right: 3px"><path fill="${theme.palette.text.primary}" d="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/></svg> ${icons}`;
  }
  if (node.hasVS && node.hasVS.hostnames && node.hasVS.hostnames.length > 0) {
    icons = `<svg viewBox="0 0 448 512" width="12" height="12" style="margin-right: 3px"><path fill="${theme.palette.text.primary}" d="M80 104a24 24 0 1 0 0-48 24 24 0 1 0 0 48zm80-24c0 32.8-19.7 61-48 73.3v87.8c18.8-10.9 40.7-17.1 64-17.1h96c35.3 0 64-28.7 64-64v-6.7C307.7 141 288 112.8 288 80c0-44.2 35.8-80 80-80s80 35.8 80 80c0 32.8-19.7 61-48 73.3V160c0 70.7-57.3 128-128 128H176c-35.3 0-64 28.7-64 64v6.7c28.3 12.3 48 40.5 48 73.3c0 44.2-35.8 80-80 80s-80-35.8-80-80c0-32.8 19.7-61 48-73.3V352 153.3C19.7 141 0 112.8 0 80C0 35.8 35.8 0 80 0s80 35.8 80 80zm232 0a24 24 0 1 0 -48 0 24 24 0 1 0 48 0zM80 456a24 24 0 1 0 0-48 24 24 0 1 0 0 48z"/></svg> ${icons}`;
  } else if (node.hasRequestRouting) {
    icons = `<svg viewBox="0 0 448 512" width="12" height="12" style="margin-right: 3px"><path fill="${theme.palette.text.primary}" d="M80 104a24 24 0 1 0 0-48 24 24 0 1 0 0 48zm80-24c0 32.8-19.7 61-48 73.3v87.8c18.8-10.9 40.7-17.1 64-17.1h96c35.3 0 64-28.7 64-64v-6.7C307.7 141 288 112.8 288 80c0-44.2 35.8-80 80-80s80 35.8 80 80c0 32.8-19.7 61-48 73.3V160c0 70.7-57.3 128-128 128H176c-35.3 0-64 28.7-64 64v6.7c28.3 12.3 48 40.5 48 73.3c0 44.2-35.8 80-80 80s-80-35.8-80-80c0-32.8 19.7-61 48-73.3V352 153.3C19.7 141 0 112.8 0 80C0 35.8 35.8 0 80 0s80 35.8 80 80zm232 0a24 24 0 1 0 -48 0 24 24 0 1 0 48 0zM80 456a24 24 0 1 0 0-48 24 24 0 1 0 0 48z"/></svg> ${icons}`;
  }

  if (icons.length > 0) {
    return `<div class="kobsio-kiali-label">
      <div class="kobsio-kiali-label-icon-wrapper">${icons}</div>
      <div class="kobsio-kiali-label-text icon">
        ${node.nodeLabel}${node.isOutside ? `<br/>(${node.namespace})` : ''}
      </div>
    </div>`;
  }

  return `<div class="kobsio-kiali-label">
    <div class="kobsio-kiali-label-text">
      ${node.nodeLabel}${node.isOutside ? `<br/>(${node.namespace})` : ''}
    </div>
  </div>`;
};

const Graph: FunctionComponent<{
  edges: cytoscape.ElementDefinition[];
  instance: IPluginInstance;
  nodes: cytoscape.ElementDefinition[];
  setDetails: (details: React.ReactNode) => void;
  times: ITimes;
}> = ({ instance, edges, nodes, times, setDetails }) => {
  const theme = useTheme();
  const wrapper = useRef<HTMLDivElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const graph = useRef<cytoscape.Core>();
  const layout = useRef<cytoscape.Layouts>();
  const size = useDimensions(wrapper);

  // onTap is used to display the details drawer for a selected edge/node. When the user clicks on a edge/node the onTap
  // function is called. We then check, which type the clicked element has and display the corresponding details
  // component in the drawer panel.
  const onTap = useCallback(
    (event: cytoscape.EventObject): void => {
      const ele = event.target;
      const data = ele.data();

      if (data.nodeType) {
        setDetails(
          <Node
            instance={instance}
            times={times}
            node={data}
            nodes={nodes as INodeWrapper[]}
            edges={edges as IEdgeWrapper[]}
            open={true}
            onClose={(): void => setDetails(undefined)}
          />,
        );
      }

      if (data.edgeType) {
        setDetails(
          <Edge
            instance={instance}
            times={times}
            edge={data}
            nodes={nodes as INodeWrapper[]}
            open={true}
            onClose={(): void => setDetails(undefined)}
          />,
        );
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [instance, times, nodes, setDetails],
  );

  useEffect(() => {
    setTimeout(() => {
      if (graph.current) {
        if (layout.current) {
          layout.current.stop();
        }

        graph.current.add({
          edges: edges as cytoscape.EdgeDefinition[],
          nodes: nodes as cytoscape.NodeDefinition[],
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
            tpl: (node: INodeData) => nodeLabel(theme, node),
            valign: 'bottom',
            valignBox: 'bottom',
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
            '.kobsio-kiali-label': {
              borderRadius: '3px',
              boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 2px 8px 0 rgba(0, 0, 0, 0.19)',
              display: 'flex',
              fontFamily: theme.typography.fontFamily,
              fontSize: '8px',
              fontWeight: 'normal',
              lineHeight: '11px',
              marginTop: '4px',
              textAlign: 'center',
            },
            '.kobsio-kiali-label-badge': {
              backgroundColor: theme.palette.primary.main,
              marginRight: '5px',
              minWidth: '24px',
              paddingLeft: '0px',
              paddingRight: '0px',
            },
            '.kobsio-kiali-label-icon': {
              marginLeft: '1px',
            },
            '.kobsio-kiali-label-icon-wrapper': {
              alignItems: 'center',
              backgroundColor: deepPurple[500],
              borderBottomLeftRadius: '3px',
              borderTopLeftRadius: '3px',
              color: theme.palette.text.primary,
              display: 'flex',
              fontSize: '12px',
              paddingBottom: '3px',
              paddingLeft: '4px',
              paddingRight: '0px',
              paddingTop: '3px',
            },
            '.kobsio-kiali-label-text': {
              alignItems: 'center',
              backgroundColor: theme.palette.background.paper,
              borderRadius: '3px',
              borderWidth: '1px',
              color: theme.palette.text.primary,
              display: 'flex',
              fontSize: '8px',
              padding: '3px 5px',
            },
            '.kobsio-kiali-label-text.boxed': {
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
            },
            '.kobsio-kiali-label-text.icon': {
              borderBottomLeftRadius: 'unset',
              borderColor: deepPurple[500],
              borderLeft: 0,
              borderStyle: 'solid',
              borderTopLeftRadius: 'unset',
            },
            '.kobsio-kiali-label.boxed': {
              marginTop: '13px',
            },
            height: `${size.height}px`,
            width: `${size.width}px`,
          }}
          ref={container}
          data-testid="kiali-topology-graph"
        />
      ) : null}
    </Box>
  );
};

export const Topology: FunctionComponent<{
  application?: string;
  instance: IPluginInstance;
  namespaces: string[];
  times: ITimes;
}> = ({ instance, application, namespaces, times }) => {
  const apiContext = useContext<IAPIContext>(APIContext);
  const [details, setDetails] = useState<ReactNode | undefined>(undefined);

  const { isError, isLoading, error, data, refetch } = useQuery<IGraph, APIError>(
    ['kiali/topology', instance, application, namespaces, times],
    async () => {
      let url = '';
      if (application) {
        url = `/api/plugins/kiali/graph?application=${application}&namespace=${namespaces[0]}&duration=${
          times.timeEnd - times.timeStart
        }&graphType=versionedApp&injectServiceNodes=true&groupBy=app${[
          'deadNode',
          'sidecarsCheck',
          'serviceEntry',
          'istio',
        ].join('&appender=')}`;
      } else {
        const n = namespaces.map((namespace) => `namespace=${namespace}`).join('&');
        url = `/api/plugins/kiali/graph?duration=${
          times.timeEnd - times.timeStart
        }&graphType=versionedApp&injectServiceNodes=true&groupBy=app${[
          'deadNode',
          'sidecarsCheck',
          'serviceEntry',
          'istio',
        ].join('&appender=')}&${n}`;
      }

      return apiContext.client.get<IGraph>(url, {
        headers: {
          'x-kobs-cluster': instance.cluster,
          'x-kobs-plugin': instance.name,
        },
      });
    },
  );

  return (
    <UseQueryWrapper
      error={error}
      errorTitle="Failed to load topology graph"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data || !data.elements || !data.elements.nodes || !data.elements.edges}
      noDataTitle="No topology graph was found"
      refetch={refetch}
    >
      <Box sx={{ display: 'flex', flexGrow: 1, minHeight: '100%' }}>
        <Graph
          instance={instance}
          edges={(data?.elements?.edges as cytoscape.ElementDefinition[]) ?? []}
          nodes={(data?.elements?.nodes as cytoscape.ElementDefinition[]) ?? []}
          times={times}
          setDetails={setDetails}
        />

        {details && details}
      </Box>
    </UseQueryWrapper>
  );
};
