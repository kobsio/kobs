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
  responseTime: Metric.AsObject[];
  traffic: Metric.AsObject[];
}

interface IKialiDetailsEdgeMetricsHTTPProps {
  name: string;
  duration: number;
  edge: Edge.AsObject;
  sourceNode: Node.AsObject;
  targetNode: Node.AsObject;
}

const KialiDetailsEdgeMetricsHTTP: React.FunctionComponent<IKialiDetailsEdgeMetricsHTTPProps> = ({
  name,
  duration,
  edge,
  sourceNode,
  targetNode,
}: IKialiDetailsEdgeMetricsHTTPProps) => {
  const [data, setData] = useState<IDataState>({ error: '', isLoading: false, responseTime: [], traffic: [] });

  const fetchGraph = useCallback(async (): Promise<void> => {
    try {
      setData({ error: '', isLoading: true, responseTime: [], traffic: [] });

      let nodeType = 'workloads';
      let nodeName = targetNode.workload;
      let byLabels = ['destination_service_name'];
      let reporter = 'destination';

      if (targetNode.nodetype === 'service') {
        nodeType = 'services';
        nodeName = targetNode.service;
        byLabels = ['source_workload'];
        reporter = 'source';
      }

      if (sourceNode.nodetype === 'unknown') {
        reporter = 'destination';
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
      getMetricsRequest.setFiltersList(['request_count', 'request_duration_millis', 'request_error_count']);
      getMetricsRequest.setBylabelsList(byLabels);
      getMetricsRequest.setDirection('inbound');
      getMetricsRequest.setReporter(reporter);
      getMetricsRequest.setRequestprotocol('http');

      const getMetricsResponse: GetMetricsResponse = await kialiService.getMetrics(getMetricsRequest, null);
      const metrics = getMetricsResponse.toObject().metricsList.filter((metric) => metric.label === filterName);

      const traffic = metrics.filter((metric) => metric.name === 'request_count');
      traffic.push(...metrics.filter((metric) => metric.name === 'request_error_count'));

      setData({
        error: '',
        isLoading: false,
        responseTime: metrics.filter((metric) => metric.name === 'request_duration_millis'),
        traffic: traffic,
      });
    } catch (err) {
      setData({ error: err.message, isLoading: false, responseTime: [], traffic: [] });
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

  return (
    <React.Fragment>
      {data.traffic.length === 0 ? (
        <Alert variant={AlertVariant.info} title="Not enough traffic to generate chart" />
      ) : (
        <Card isCompact={true}>
          <CardTitle>HTTP Request Traffic</CardTitle>
          <CardBody>
            <KialiChart unit="req/s" metrics={data.traffic} />
          </CardBody>
        </Card>
      )}

      <p>&nbsp;</p>
      <p>&nbsp;</p>

      {data.responseTime.length === 0 ? (
        <Alert variant={AlertVariant.info} title="Not enough traffic to generate chart" />
      ) : (
        <Card isCompact={true}>
          <CardTitle>HTTP Request Response Time</CardTitle>
          <CardBody>
            <KialiChart unit="ms" metrics={data.responseTime} />
          </CardBody>
        </Card>
      )}
    </React.Fragment>
  );
};

export default KialiDetailsEdgeMetricsHTTP;
