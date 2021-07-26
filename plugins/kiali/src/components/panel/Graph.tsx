import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import dagre from 'cytoscape-dagre';

import { IEdgeWrapper, INodeData, INodeWrapper } from '../../utils/interfaces';
import Edge from './details/Edge';
import { IPluginTimes } from '@kobsio/plugin-core';
import Node from './details/Node';

cytoscape.use(dagre);

// layout is the layout for the topology graph.
// See: https://js.cytoscape.org/#layouts
const layout = {
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
  name: string;
  times: IPluginTimes;
  edges: cytoscape.ElementDefinition[];
  nodes: cytoscape.ElementDefinition[];
  setDetails?: (details: React.ReactNode) => void;
}

const Graph: React.FunctionComponent<IGraphProps> = ({ name, times, edges, nodes, setDetails }: IGraphProps) => {
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<cytoscape.Core | null>(null);

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
            name={name}
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
            name={name}
            times={times}
            edge={data}
            nodes={nodes as INodeWrapper[]}
            close={(): void => setDetails(undefined)}
          />,
        );
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [name, times, nodes, setDetails],
  );

  const cyCallback = useCallback(
    (cy: cytoscape.Core): void => {
      if (graphRef.current) return;
      graphRef.current = cy;
      cy.on('tap', onTap);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (cy as any).nodeHtmlLabel([
        {
          halign: 'center',
          halignBox: 'center',
          query: 'node:visible',
          tpl: nodeLabel,
          valign: 'bottom',
          valignBox: 'bottom',
        },
      ]);
    },
    [onTap],
  );

  // useEffect is used to adjust the size of the topology graph container, so it takes the maximum available space.
  useEffect(() => {
    if (containerRef && containerRef.current) {
      setWidth(containerRef.current.getBoundingClientRect().width);
      setHeight(containerRef.current.getBoundingClientRect().height);
    }
  }, [edges, nodes]);

  // useEffect is used to remove the tab listener, when the component is unmounted.
  useEffect(() => {
    return (): void => {
      if (graphRef.current) {
        graphRef.current.removeListener('tab', onTap);
        graphRef.current = null;
      }
    };
  }, [onTap]);

  return (
    <div style={{ minHeight: '100%' }} ref={containerRef}>
      {height > 0 && width > 0 ? (
        <CytoscapeComponent
          elements={CytoscapeComponent.normalizeElements({ edges: edges, nodes: nodes })}
          style={{ height: `${height}px`, width: `${width}px` }}
          zoomingEnabled={true}
          maxZoom={5}
          minZoom={0.1}
          autounselectify={false}
          boxSelectionEnabled={true}
          layout={layout}
          stylesheet={styleSheet}
          cy={cyCallback}
        />
      ) : null}
    </div>
  );
};

export default memo(Graph, (prevProps, nextProps) => {
  if (
    JSON.stringify(prevProps.edges) === JSON.stringify(nextProps.edges) &&
    JSON.stringify(prevProps.nodes) === JSON.stringify(nextProps.nodes)
  ) {
    return true;
  }

  return false;
});
