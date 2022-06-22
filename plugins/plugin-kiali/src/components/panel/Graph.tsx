/* eslint-disable @typescript-eslint/naming-convention */
import React, { useCallback, useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import nodeHtmlLabel from 'cytoscape-node-html-label';

import { IEdgeWrapper, INodeData, INodeWrapper } from '../../utils/interfaces';
import { IPluginInstance, ITimes, useDimensions } from '@kobsio/shared';
import Edge from './details/Edge';
import Node from './details/Node';

import '../../assets/graph.css';

// layout is the layout for the topology graph.
// See: https://js.cytoscape.org/#layouts
const dagreLayout = {
  fit: true,
  name: 'dagre',
  nodeDimensionsIncludeLabels: true,
  rankDir: 'LR',
};

// styleSheet changes the style of the nodes and edges in the topology graph.
// See: https://js.cytoscape.org/#style
const styleSheet: cytoscape.Stylesheet[] = [
  {
    selector: 'node',
    style: {
      'background-color': '#ffffff',
      'background-fit': 'cover',
      'background-height': '80%',
      'background-image': 'data(nodeImage)',
      'background-position-x': '50%',
      'background-position-y': '50%',
      'background-width': '80%',
      'border-color': '#6a6e73',
      'border-opacity': 1,
      'border-width': 1,
      color: '#151515',
      'font-family': 'RedHatDisplay, Overpass, overpass, helvetica, arial, sans-serif',
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
      color: '#151515',
      'curve-style': 'bezier',
      'font-family': 'RedHatDisplay, Overpass, overpass, helvetica, arial, sans-serif',
      'font-size': 10,
      label: 'data(edgeLabel)',
      'line-color': '#6a6e73',
      'target-arrow-color': '#6a6e73',
      'target-arrow-shape': 'triangle',
      'text-wrap': 'wrap',
      width: 3,
    },
  },
  {
    selector: 'edge[edgeType="tcp"]',
    style: {
      'line-color': '#0066cc',
      'target-arrow-color': '#0066cc',
    },
  },
  {
    selector: 'edge[edgeType="grpc"]',
    style: {
      'line-color': '#009596',
      'target-arrow-color': '#009596',
    },
  },
  {
    selector: 'edge[edgeType="http"]',
    style: {
      'line-color': '#3e8635',
      'target-arrow-color': '#3e8635',
    },
  },
  {
    selector: 'edge[edgeType="httphealthy"]',
    style: {
      'line-color': '#3e8635',
      'target-arrow-color': '#3e8635',
    },
  },
  {
    selector: 'edge[edgeType="httpdegraded"]',
    style: {
      'line-color': '#f0ab00',
      'target-arrow-color': '#f0ab00',
    },
  },
  {
    selector: 'edge[edgeType="httpfailure"]',
    style: {
      'line-color': '#c9190b',
      'target-arrow-color': '#c9190b',
    },
  },
];

const nodeLabel = (node: INodeData): string => {
  if (node.isBox) {
    return `<div class="kobsio-kiali-label boxed">
      <div class="kobsio-kiali-label-text boxed">
        <span class="pf-c-badge pf-m-unread kobsio-kiali-label-badge">A</span>
        ${node.nodeLabel}${node.isOutside ? `<br/>(${node.namespace})` : ''}
      </div>
    </div>`;
  }

  let icons = '';
  if (node.isRoot) {
    icons = `<span class="fa fa-arrow-alt-circle-right kobsio-kiali-label-icon"></span> ${icons}`;
  }
  if (node.hasMissingSC) {
    icons = `<span class="pf-icon pf-icon-blueprint kobsio-kiali-label-icon"></span> ${icons}`;
  }
  if (node.hasCB) {
    icons = `<span class="fa fa-bolt kobsio-kiali-label-icon"></span> ${icons}`;
  }
  if (node.hasVS) {
    icons = `<span class="fa fa-code-branch kobsio-kiali-label-icon"></span> ${icons}`;
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

interface IGraphProps {
  instance: IPluginInstance;
  times: ITimes;
  edges: cytoscape.ElementDefinition[];
  nodes: cytoscape.ElementDefinition[];
  setDetails?: (details: React.ReactNode) => void;
}

const Graph: React.FunctionComponent<IGraphProps> = ({ instance, times, edges, nodes, setDetails }: IGraphProps) => {
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

      if (data.nodeType && setDetails) {
        setDetails(
          <Node
            instance={instance}
            times={times}
            node={data}
            nodes={nodes as INodeWrapper[]}
            edges={edges as IEdgeWrapper[]}
            close={(): void => setDetails(undefined)}
          />,
        );
      }

      if (data.edgeType && setDetails) {
        setDetails(
          <Edge
            instance={instance}
            times={times}
            edge={data}
            nodes={nodes as INodeWrapper[]}
            close={(): void => setDetails(undefined)}
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
          style: styleSheet,
        });
        graph.current.on('tap', onTap);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (graph.current as any).nodeHtmlLabel([
          {
            halign: 'center',
            halignBox: 'center',
            query: 'node:visible',
            tpl: nodeLabel,
            valign: 'bottom',
            valignBox: 'bottom',
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
    <div style={{ minHeight: '100%' }} ref={wrapper}>
      {size.height > 0 && size.width > 0 ? (
        <div style={{ height: `${size.height}px`, width: `${size.width}px` }} ref={container} />
      ) : null}
    </div>
  );
};

export default Graph;
