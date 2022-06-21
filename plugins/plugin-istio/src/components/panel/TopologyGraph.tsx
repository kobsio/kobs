/* eslint-disable @typescript-eslint/naming-convention */
import React, { useCallback, useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import nodeHtmlLabel from 'cytoscape-node-html-label';

import { IEdge, INode, INodeData } from '../../utils/interfaces';
import { IPluginInstance, ITimes, useDimensions } from '@kobsio/shared';
import DetailsMetrics from './details/DetailsMetrics';
import { formatNumber } from '../../utils/helpers';

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
  const application = node.metrics.hasOwnProperty('destination_app')
    ? node.metrics['destination_app']
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
      label: 'data(id)',
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

interface ITopologyGraphProps {
  instance: IPluginInstance;
  edges: IEdge[];
  nodes: INode[];
  namespace: string;
  application: string;
  times: ITimes;
  setDetails?: (details: React.ReactNode) => void;
}

const TopologyGraph: React.FunctionComponent<ITopologyGraphProps> = ({
  instance,
  edges,
  nodes,
  namespace,
  application,
  times,
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

      if (data.metrics && setDetails) {
        setDetails(
          <DetailsMetrics
            instance={instance}
            namespace={namespace}
            application={application}
            row={data.metrics}
            times={times}
            close={(): void => setDetails(undefined)}
          />,
        );
      }
    },
    [instance, namespace, application, times, setDetails],
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
