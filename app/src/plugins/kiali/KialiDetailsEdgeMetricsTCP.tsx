import { Alert, AlertVariant, Card, CardBody, CardTitle, Spinner } from '@patternfly/react-core';
import React, { useCallback, useEffect, useState } from 'react';

import { Edge, GetMetricsRequest, GetMetricsResponse, KialiPromiseClient, Metric, Node } from 'proto/kiali_grpc_web_pb';
import KialiChart from 'plugins/kiali/KialiChart';
import { apiURL } from 'utils/constants';

// kialiService is the gRPC service to get the metrics for the selected edge.
const kialiService = new KialiPromiseClient(apiURL, null, null);

interface IDataState {
  error: string;
  isLoading: boolean;
  metrics: Metric.AsObject[];
}

interface IKialiDetailsEdgeMetricsTCPProps {
  name: string;
  duration: number;
  edge: Edge.AsObject;
  sourceNode: Node.AsObject;
  targetNode: Node.AsObject;
}

const KialiDetailsEdgeMetricsTCP: React.FunctionComponent<IKialiDetailsEdgeMetricsTCPProps> = ({
  name,
  duration,
  edge,
  sourceNode,
  targetNode,
}: IKialiDetailsEdgeMetricsTCPProps) => {
  const [data, setData] = useState<IDataState>({ error: '', isLoading: false, metrics: [] });

  const fetchGraph = useCallback(async (): Promise<void> => {
    try {
      setData({ error: '', isLoading: true, metrics: [] });

      let nodeType = 'workloads';
      let nodeName = targetNode.workload;
      let byLabels = ['destination_service_name'];
      let direction = 'inbound';

      if (targetNode.nodetype === 'service') {
        nodeType = 'services';
        nodeName = targetNode.service;
        byLabels = ['source_workload'];
      } else if (targetNode.nodetype === 'serviceentry') {
        nodeType = 'workloads';
        nodeName = sourceNode.app;
        direction = 'outbound';
      }

      let filterName = sourceNode.workload;

      if (sourceNode.nodetype === 'service') {
        filterName = sourceNode.service;
      }

      const getMetricsRequest = new GetMetricsRequest();
      getMetricsRequest.setName(name);
      getMetricsRequest.setNamespace(targetNode.namespace);
      getMetricsRequest.setNodetype(nodeType);
      getMetricsRequest.setNodename(nodeName);
      getMetricsRequest.setQuerytime(Math.floor(Date.now() / 1000));
      getMetricsRequest.setDuration(duration);
      getMetricsRequest.setStep(30);
      getMetricsRequest.setRateinterval('30s');
      getMetricsRequest.setFiltersList(['tcp_sent', 'tcp_received']);
      getMetricsRequest.setBylabelsList(byLabels);
      getMetricsRequest.setDirection(direction);
      getMetricsRequest.setReporter('source');

      const getMetricsResponse: GetMetricsResponse = await kialiService.getMetrics(getMetricsRequest, null);
      const metrics = getMetricsResponse.toObject().metricsList.filter((metric) => metric.label === filterName);

      setData({ error: '', isLoading: false, metrics: metrics });
    } catch (err) {
      setData({ error: err.message, isLoading: false, metrics: [] });
    }
  }, [name, duration, sourceNode, targetNode]);

  useEffect(() => {
    fetchGraph();
  }, [fetchGraph]);

  if (data.isLoading) {
    return (
      <div className="pf-u-text-align-center">
        <Spinner />
      </div>
    );
  }

  if (data.error) {
    return (
      <Alert variant={AlertVariant.danger} title="Could not get metrics">
        <p>{data.error}</p>
      </Alert>
    );
  }

  if (data.metrics.length === 0) {
    return <Alert variant={AlertVariant.info} title="Not enough traffic to generate chart" />;
  }

  return (
    <Card isCompact={true}>
      <CardTitle>TCP Traffic</CardTitle>
      <CardBody>
        <KialiChart unit="B/s" metrics={data.metrics} />
      </CardBody>
    </Card>
  );
};

export default KialiDetailsEdgeMetricsTCP;
