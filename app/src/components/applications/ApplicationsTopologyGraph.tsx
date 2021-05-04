import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';

// layout is the layout for the topology graph.
// See: https://js.cytoscape.org/#layouts
const layout = {
  animate: false,
  avoidOverlap: true,
  directed: true,
  fit: true,
  name: 'breadthfirst',
  nodeDimensionsIncludeLabels: false,
  padding: 50,
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
      'text-valign': 'bottom',
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
      'background-color': '#0066cc',
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

interface IApplicationsTopologyGraphProps {
  edges: cytoscape.ElementDefinition[];
  nodes: cytoscape.ElementDefinition[];
  selectEdge: (title: string, description: string) => void;
  selectNode: (cluster: string, namespace: string, name: string) => void;
}

// ApplicationsTopologyGraph is the component, which renders the topology graph.
const ApplicationsTopologyGraph: React.FunctionComponent<IApplicationsTopologyGraphProps> = ({
  edges,
  nodes,
  selectEdge,
  selectNode,
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
      const data = node.data();

      if (data.type === 'dependency' && data.description) {
        selectEdge(data.label, data.description);
      } else if (data.type === 'application') {
        selectNode(data.cluster, data.namespace, data.name);
      }
    },
    [selectEdge, selectNode],
  );

  const cyCallback = useCallback(
    (cy: cytoscape.Core): void => {
      if (graphRef.current) return;
      graphRef.current = cy;
      cy.on('tap', onTap);
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

// export default ApplicationsTopologyGraph;
export default memo(ApplicationsTopologyGraph, (prevProps, nextProps) => {
  if (
    JSON.stringify(prevProps.edges) === JSON.stringify(nextProps.edges) &&
    JSON.stringify(prevProps.nodes) === JSON.stringify(nextProps.nodes)
  ) {
    return true;
  }

  return false;
});
