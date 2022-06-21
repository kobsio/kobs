/* eslint-disable @typescript-eslint/naming-convention */
import React, { useCallback, useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import nodeHtmlLabel from 'cytoscape-node-html-label';

import { IEdge, INode, INodeData } from './utils/interfaces';
import ApplicationDetailsWrapper from './ApplicationDetailsWrapper';
import { useDimensions } from '@kobsio/shared';

import '../../assets/topologygraph.css';

// dagreLayout is the layout for the topology graph.
// See: https://js.cytoscape.org/#layouts
const dagreLayout = {
  fit: true,
  name: 'dagre',
  nodeDimensionsIncludeLabels: true,
  rankDir: 'LR',
};

const nodeLabel = (node: INodeData): string => {
  return `<div class="pf-u-text-wrap kobsio-application-topology-label">
      <div>
        <dl class="pf-c-description-list pf-m-horizontal pf-m-fluid kobsio-application-topology-list">
          <div class="pf-c-description-list__group">
            <dt class="pf-c-description-list__term">
              <span class="pf-c-description-list__text">Name:</span>
            </dt>
            <dd class="pf-c-description-list__description">
              <div class="pf-c-description-list__text">${node.name}</div>
            </dd>
          </div>

          <div class="pf-c-description-list__group">
            <dt class="pf-c-description-list__term">
              <span class="pf-c-description-list__text">Namespace:</span>
            </dt>
            <dd class="pf-c-description-list__description">
              <div class="pf-c-description-list__text">${node.namespace}</div>
            </dd>
          </div>

          <div class="pf-c-description-list__group">
            <dt class="pf-c-description-list__term">
              <span class="pf-c-description-list__text">Cluster:</span>
            </dt>
            <dd class="pf-c-description-list__description">
              <div class="pf-c-description-list__text">${node.cluster}</div>
            </dd>
          </div>

          ${
            node.external &&
            `<div class="pf-c-description-list__group">
            <dt class="pf-c-description-list__term">
              <span class="pf-c-description-list__text">External:</span>
            </dt>
            <dd class="pf-c-description-list__description">
              <div class="pf-c-description-list__text">True</div>
            </dd>
          </div>`
          }
        </dl>
      </div>
    </div>`;
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
      'line-color': '#0066cc',
      'target-arrow-color': '#0066cc',
      'target-arrow-shape': 'triangle',
      width: 3,
    },
  },
];

interface ITopologyGraphProps {
  edges: IEdge[];
  nodes: INode[];
  setDetails?: (details: React.ReactNode) => void;
}

const TopologyGraph: React.FunctionComponent<ITopologyGraphProps> = ({
  edges,
  nodes,
  setDetails,
}: ITopologyGraphProps) => {
  const wrapper = useRef<HTMLDivElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const graph = useRef<cytoscape.Core>();
  const layout = useRef<cytoscape.Layouts>();
  const size = useDimensions(wrapper);

  const onTap = useCallback(
    (event: cytoscape.EventObject): void => {
      const node = event.target;
      const data: INodeData = node.data();

      if (data.id && data.cluster && data.namespace && data.name && setDetails) {
        setDetails(
          <ApplicationDetailsWrapper
            id={data.id}
            cluster={data.cluster}
            namespace={data.namespace}
            name={data.name}
            close={(): void => setDetails(undefined)}
          />,
        );
      }
    },
    [setDetails],
  );

  useEffect(() => {
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
          elements: {
            edges: edges,
            nodes: nodes,
          },
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
    <div style={{ minHeight: '100%' }} ref={wrapper}>
      {size.height > 0 && size.width > 0 ? (
        <div style={{ height: `${size.height}px`, width: `${size.width}px` }} ref={container} />
      ) : null}
    </div>
  );
};

export default TopologyGraph;
