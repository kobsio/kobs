import React, { useCallback, useEffect, useRef, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import nodeHtmlLabel from 'cytoscape-node-html-label';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import dagre from 'cytoscape-dagre';

import { IEdge, INode, INodeData } from '../../utils/interfaces';
import { IRowValues } from '@kobsio/plugin-prometheus';
import { formatNumber } from '../../utils/helpers';

cytoscape.use(dagre);
nodeHtmlLabel(cytoscape);

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
      'border-color': '#6a6e73',
      'border-opacity': 1,
      'border-width': 1,
      color: '#151515',
      'font-family': 'RedHatDisplay, Overpass, overpass, helvetica, arial, sans-serif',
      height: '300px',
      label: 'data(label)',
      shape: 'roundrectangle',
      'text-halign': 'center',
      'text-opacity': 0,
      'text-valign': 'bottom',
      'text-wrap': 'wrap',
      width: '200px',
    },
  },
  {
    selector: 'edge',
    style: {
      'curve-style': 'bezier',
      'line-color': '#0066cc',
      'target-arrow-color': '#0066cc',
      'target-arrow-shape': 'triangle',
      width: 3,
    },
  },
];

const nodeLabel = (node: INodeData): string => {
  const application = node.metrics.hasOwnProperty('destination_workload')
    ? node.metrics['destination_workload']
    : node.metrics.hasOwnProperty('source_workload')
    ? node.metrics['source_workload']
    : node.metrics['destination_service'];
  const namespace = node.metrics.hasOwnProperty('destination_workload_namespace')
    ? node.metrics['destination_workload_namespace']
    : node.metrics.hasOwnProperty('destination_workload_namespace')
    ? node.metrics['source_workload_namespace']
    : '';

  return `<div class="pf-u-text-wrap kobsio-istio-label">
      <div class="pf-u-mb-xl">
        <span class="pf-u-font-size-lg pf-u-font-weight-bold">${application}</span>
        <span class="pf-u-font-size-md pf-u-color-400">${namespace}</span>
      </div>
      <div>
        <dl class="pf-c-description-list pf-m-horizontal pf-m-fluid kobsio-istio-list">
          <div class="pf-c-description-list__group">
            <dt class="pf-c-description-list__term">
              <span class="pf-c-description-list__text">SR:</span>
            </dt>
            <dd class="pf-c-description-list__description">
              <div class="pf-c-description-list__text">${formatNumber(node.metrics['value-1'], '%')}</div>
            </dd>
          </div>

          <div class="pf-c-description-list__group">
            <dt class="pf-c-description-list__term">
              <span class="pf-c-description-list__text">RPS:</span>
            </dt>
            <dd class="pf-c-description-list__description">
              <div class="pf-c-description-list__text">${formatNumber(node.metrics['value-2'])}</div>
            </dd>
          </div>

          <div class="pf-c-description-list__group">
            <dt class="pf-c-description-list__term">
              <span class="pf-c-description-list__text">P50:</span>
            </dt>
            <dd class="pf-c-description-list__description">
              <div class="pf-c-description-list__text">${formatNumber(node.metrics['value-3'], 'ms')}</div>
            </dd>
          </div>

          <div class="pf-c-description-list__group">
            <dt class="pf-c-description-list__term">
              <span class="pf-c-description-list__text">P90:</span>
            </dt>
            <dd class="pf-c-description-list__description">
              <div class="pf-c-description-list__text">${formatNumber(node.metrics['value-4'], 'ms')}</div>
            </dd>
          </div>

          <div class="pf-c-description-list__group">
            <dt class="pf-c-description-list__term">
              <span class="pf-c-description-list__text">P99</span>
            </dt>
            <dd class="pf-c-description-list__description">
              <div class="pf-c-description-list__text">${formatNumber(node.metrics['value-5'], 'ms')}</div>
            </dd>
          </div>
        </dl>
      </div>
    </div>`;
};

interface ITopologyGraphProps {
  edges: IEdge[];
  nodes: INode[];
  showDetails?: (row: IRowValues) => void;
}

const TopologyGraph: React.FunctionComponent<ITopologyGraphProps> = ({
  edges,
  nodes,
  showDetails,
}: ITopologyGraphProps) => {
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<cytoscape.Core | null>(null);

  // onTap is called, when the user selects an edge or node in the topology chart. When the user selects a node we are
  // showing some details for this node.
  const onTap = useCallback(
    (event: cytoscape.EventObject): void => {
      const node = event.target;
      const data: INodeData = node.data();

      if (data.metrics && showDetails) {
        showDetails(data.metrics);
      }
    },
    [showDetails],
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
          valign: 'center',
          valignBox: 'center',
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

export default TopologyGraph;
