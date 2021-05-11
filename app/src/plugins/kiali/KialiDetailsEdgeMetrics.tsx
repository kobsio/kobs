import React from 'react';

import { Edge, Node } from 'proto/kiali_grpc_web_pb';
import KialiDetailsEdgeMetricsGRPC from 'plugins/kiali/KialiDetailsEdgeMetricsGRPC';
import KialiDetailsEdgeMetricsHTTP from 'plugins/kiali/KialiDetailsEdgeMetricsHTTP';
import KialiDetailsEdgeMetricsTCP from 'plugins/kiali/KialiDetailsEdgeMetricsTCP';

interface IKialiDetailsEdgeMetricsProps {
  name: string;
  duration: number;
  edge: Edge.AsObject;
  sourceNode: Node.AsObject;
  targetNode: Node.AsObject;
}

// KialiDetailsEdgeMetrics is a wrapper component for the metrics of an edge. We use this component to decide if we have
// to display the http, tcp or grpc metrics for the edge.
// This component is displayed for all tabs, below the actual tab content.
const KialiDetailsEdgeMetrics: React.FunctionComponent<IKialiDetailsEdgeMetricsProps> = ({
  name,
  duration,
  edge,
  sourceNode,
  targetNode,
}: IKialiDetailsEdgeMetricsProps) => {
  return (
    <div style={{ maxWidth: '100%', overflowX: 'scroll', padding: '24px 24px' }}>
      {edge.traffic?.protocol === 'tcp' ? (
        <KialiDetailsEdgeMetricsTCP
          name={name}
          duration={duration}
          edge={edge}
          sourceNode={sourceNode}
          targetNode={targetNode}
        />
      ) : edge.traffic?.protocol === 'http' ? (
        <KialiDetailsEdgeMetricsHTTP
          name={name}
          duration={duration}
          edge={edge}
          sourceNode={sourceNode}
          targetNode={targetNode}
        />
      ) : edge.traffic?.protocol === 'grpc' ? (
        <KialiDetailsEdgeMetricsGRPC
          name={name}
          duration={duration}
          edge={edge}
          sourceNode={sourceNode}
          targetNode={targetNode}
        />
      ) : null}
    </div>
  );
};

export default KialiDetailsEdgeMetrics;
