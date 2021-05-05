import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import dagre from 'cytoscape-dagre';

import { Node } from 'proto/kiali_grpc_web_pb';

import 'plugins/kiali/kiali.css';

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
      'background-image': 'data(nodeimage)',
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
      label: 'data(nodelabelfull)',
      'text-halign': 'center',
      'text-opacity': 0,
      'text-valign': 'bottom',
      'text-wrap': 'wrap',
    },
  },
  {
    selector: 'node[nodetype="box"]',
    style: {
      shape: 'roundrectangle',
    },
  },
  {
    selector: 'node[nodetype="app"]',
    style: {
      shape: 'roundrectangle',
    },
  },
  {
    selector: 'node[nodetype="service"]',
    style: {
      'background-position-y': '6px',
      shape: 'round-triangle',
    },
  },
  {
    selector: 'node[nodetype="serviceentry"]',
    style: {
      shape: 'round-tag',
    },
  },
  {
    selector: 'node[nodetype="unknown"]',
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
      label: 'data(edgelabel)',
      'line-color': '#6a6e73',
      'target-arrow-color': '#6a6e73',
      'target-arrow-shape': 'triangle',
      'text-wrap': 'wrap',
      width: 3,
    },
  },
  {
    selector: 'edge[edgetype="tcp"]',
    style: {
      'line-color': '#0066cc',
      'target-arrow-color': '#0066cc',
    },
  },
  {
    selector: 'edge[edgetype="http"]',
    style: {
      'line-color': '#3e8635',
      'target-arrow-color': '#3e8635',
    },
  },
  {
    selector: 'edge[edgetype="httphealthy"]',
    style: {
      'line-color': '#3e8635',
      'target-arrow-color': '#3e8635',
    },
  },
  {
    selector: 'edge[edgetype="httpdegraded"]',
    style: {
      'line-color': '#f0ab00',
      'target-arrow-color': '#f0ab00',
    },
  },
  {
    selector: 'edge[edgetype="httpfailure"]',
    style: {
      'line-color': '#c9190b',
      'target-arrow-color': '#c9190b',
    },
  },
];

const nodeLabel = (node: Node.AsObject): string => {
  if (node.isbox) {
    return `<div class="kobsio-kiali-label boxed">
      <div class="kobsio-kiali-label-text boxed">
        <span class="pf-c-badge pf-m-unread kobsio-kiali-label-badge">A</span>
        ${node.nodelabel}${node.isoutside ? `<br/>(${node.namespace})` : ''}
      </div>
    </div>`;
  }

  let icons = '';
  if (node.isroot) {
    icons = `<span class="fa fa-arrow-alt-circle-right kobsio-kiali-label-icon"></span> ${icons}`;
  }
  if (node.hasmissingsc) {
    icons = `<span class="pf-icon pf-icon-blueprint kobsio-kiali-label-icon"></span> ${icons}`;
  }
  if (node.hascb) {
    icons = `<span class="fa fa-bolt kobsio-kiali-label-icon"></span> ${icons}`;
  }
  if (node.hasvs) {
    icons = `<span class="fa fa-code-branch kobsio-kiali-label-icon"></span> ${icons}`;
  }

  if (icons.length > 0) {
    return `<div class="kobsio-kiali-label">
      <div class="kobsio-kiali-label-icon-wrapper">${icons}</div>
      <div class="kobsio-kiali-label-text icon">
        ${node.nodelabel}${node.isoutside ? `<br/>(${node.namespace})` : ''}
      </div>
    </div>`;
  }

  return `<div class="kobsio-kiali-label">
    <div class="kobsio-kiali-label-text">
      ${node.nodelabel}${node.isoutside ? `<br/>(${node.namespace})` : ''}
    </div>
  </div>`;
};

interface IKialiGraphProps {
  edges: cytoscape.ElementDefinition[];
  nodes: cytoscape.ElementDefinition[];
}

const KialiGraph: React.FunctionComponent<IKialiGraphProps> = ({ edges, nodes }: IKialiGraphProps) => {
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<cytoscape.Core | null>(null);

  const onTap = useCallback((event: cytoscape.EventObject): void => {
    const ele = event.target;
    const data = ele.data();
    // TODO: Show drawer with metrics for the selected edge / node.
    console.log(data);
  }, []);

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

export default memo(KialiGraph, (prevProps, nextProps) => {
  if (
    JSON.stringify(prevProps.edges) === JSON.stringify(nextProps.edges) &&
    JSON.stringify(prevProps.nodes) === JSON.stringify(nextProps.nodes)
  ) {
    return true;
  }

  return false;
});
