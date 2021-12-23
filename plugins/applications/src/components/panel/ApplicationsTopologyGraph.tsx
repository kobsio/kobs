import React, { useCallback, useEffect, useRef, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import nodeHtmlLabel from 'cytoscape-node-html-label';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import dagre from 'cytoscape-dagre';

import { IEdge, INode, INodeData } from '../../utils/interfaces';

import Details from './details/Details';

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
      'border-color': '#6a6e73',
      'border-opacity': 1,
      'border-width': 1,
      color: '#151515',
      'font-family': 'RedHatDisplay, Overpass, overpass, helvetica, arial, sans-serif',
      label: 'data(label)',
      shape: 'roundrectangle',
      'text-halign': 'center',
      'text-opacity': 0,
      'text-valign': 'bottom',
      'text-wrap': 'wrap',
    },
  },
  {
    selector: "node[type='cluster']",
    style: {
      'background-color': '#f0f0f0',
    },
  },
  {
    selector: "node[type='namespace']",
    style: {
      'background-color': '#ffffff',
    },
  },
  {
    selector: "node[type='application']",
    style: {
      'background-color': '#ffffff',
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
  if (node.type === 'cluster' || node.type === 'namespace') {
    return `<div class="kobsio-application-topology-label boxed">
      <div class="kobsio-application-topology-label-text boxed">
        <span class="pf-c-badge pf-m-unread kobsio-application-topology-label-badge">
          ${node.type === 'cluster' ? 'C' : 'N'}
        </span>
        ${node.label}
      </div>
    </div>`;
  }

  return `<div class="kobsio-application-topology-label">
    <div class="kobsio-application-topology-label-text">
      ${node.label}
    </div>
  </div>`;
};

interface IApplicationsTopologyGraphProps {
  edges: IEdge[];
  nodes: INode[];
  setDetails?: (details: React.ReactNode) => void;
}

// ApplicationsTopologyGraph is the component, which renders the topology graph.
const ApplicationsTopologyGraph: React.FunctionComponent<IApplicationsTopologyGraphProps> = ({
  edges,
  nodes,
  setDetails,
}: IApplicationsTopologyGraphProps) => {
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<cytoscape.Core | null>(null);

  // onTap is called, when the user selects an edge or node in the topology chart. When the user selects an edge
  // ("dependency") and this edge contains a description we trigger the selectEdge, which then renders an info alert in
  // the parent component. When the user selects an node ("application") we trigger the selectNode function to load the
  // application details.
  const onTap = useCallback(
    (event: cytoscape.EventObject): void => {
      const node = event.target;
      const data: INodeData = node.data();

      if (data.type === 'application' && setDetails) {
        setDetails(<Details application={data} close={(): void => setDetails(undefined)} />);
      }
    },
    [setDetails],
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

export default ApplicationsTopologyGraph;
