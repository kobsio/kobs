import {
  APIContext,
  APIError,
  DetailsDrawer,
  IAPIContext,
  IPluginInstance,
  ITimes,
  UseQueryWrapper,
} from '@kobsio/core';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext, useState } from 'react';

import Chart from './Chart';

import {
  IChart,
  IEdgeData,
  INodeData,
  INodeWrapper,
  ITrafficGRPCRates,
  ITrafficHTTPRates,
  getStepAndRateIntervalParameters,
  IChartData,
  convertMetrics,
  IMetricsMap,
} from '../utils/utils';

/**
 * `getTitle` returns the title of a node for the details view. The title contains a name (title) and a badge, which is
 * used to display the node type. The node type can be SE (ServiceEntry), S (Service) or A (Application).
 */
export const getTitle = (node: INodeData): { badge: string; title: string } => {
  if (node.nodeType === 'serviceentry') {
    return { badge: 'SE', title: node.nodeLabel };
  } else if (node.nodeType === 'service') {
    return { badge: 'S', title: node.service || '' };
  }

  return { badge: 'A', title: node.app || '' };
};

const EdgeHosts: FunctionComponent<{ edge: IEdgeData }> = ({ edge }) => {
  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h6" pb={2}>
          Hosts by HTTP Code
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Host</TableCell>
                <TableCell>Req (%)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {edge.traffic && edge.traffic.responses
                ? Object.keys(edge.traffic.responses).map((responseCode) =>
                    edge.traffic && edge.traffic.responses && edge.traffic.responses[responseCode]?.hosts
                      ? Object.keys(edge.traffic.responses[responseCode]?.hosts ?? {}).map((host) => (
                          <TableRow key={`${responseCode}_${host}`}>
                            <TableCell>{responseCode}</TableCell>
                            <TableCell>{host}</TableCell>
                            <TableCell>{edge.traffic?.responses[responseCode]?.hosts?.[host]}</TableCell>
                          </TableRow>
                        ))
                      : null,
                  )
                : null}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

const EdgeFlags: FunctionComponent<{ edge: IEdgeData }> = ({ edge }) => {
  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h6" pb={2}>
          Flags by HTTP Code
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Flag</TableCell>
                <TableCell>Req (%)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {edge.traffic && edge.traffic.responses
                ? Object.keys(edge.traffic.responses).map((responseCode) =>
                    edge.traffic && edge.traffic.responses && edge.traffic.responses[responseCode]?.flags
                      ? Object.keys(edge.traffic.responses[responseCode]?.flags ?? {}).map((flag) => (
                          <TableRow key={`${responseCode}_${flag}`}>
                            <TableCell>{responseCode}</TableCell>
                            <TableCell>{flag}</TableCell>
                            <TableCell>{edge.traffic?.responses[responseCode]?.flags?.[flag]}</TableCell>
                          </TableRow>
                        ))
                      : null,
                  )
                : null}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

const EdgeTrafficGRPC: FunctionComponent<{ edge: IEdgeData }> = ({ edge }) => {
  const rates = edge.traffic && edge.traffic.rates ? (edge.traffic.rates as ITrafficGRPCRates) : undefined;

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h6" pb={2}>
          gRPC Requests per Second
        </Typography>
        {rates ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Total</TableCell>
                  <TableCell>Success (%)</TableCell>
                  <TableCell>Error (%)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>{rates.grpc}</TableCell>
                  <TableCell>{rates.grpcPercentErr ? 100 - parseFloat(rates.grpcPercentErr) : 100}</TableCell>
                  <TableCell>{rates.grpcPercentErr || 0}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        ) : null}
      </CardContent>
    </Card>
  );
};

const EdgeTrafficHTTP: FunctionComponent<{ edge: IEdgeData }> = ({ edge }) => {
  const rates = edge.traffic && edge.traffic.rates ? (edge.traffic.rates as ITrafficHTTPRates) : undefined;

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h6" pb={2}>
          HTTP Requests per Second
        </Typography>
        {rates ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Total</TableCell>
                  <TableCell>Success (%)</TableCell>
                  <TableCell>Error (%)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>{rates.http}</TableCell>
                  <TableCell>{rates.httpPercentErr ? 100 - parseFloat(rates.httpPercentErr) : 100}</TableCell>
                  <TableCell>{rates.httpPercentErr || 0}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        ) : null}
      </CardContent>
    </Card>
  );
};

const EdgeMetricsTCP: FunctionComponent<{
  instance: IPluginInstance;
  sourceNode: INodeWrapper;
  targetNode: INodeWrapper;
  times: ITimes;
}> = ({ instance, times, sourceNode, targetNode }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<IChart[], APIError>(
    ['kiali/metrics/edge/tcp', instance, times, sourceNode, targetNode],
    async () => {
      if (targetNode.data?.namespace === 'unknown') {
        return [];
      }

      let nodeType = 'workloads';
      let nodeName = targetNode.data?.workload;
      let byLabels = '&byLabels[]=destination_service_name';
      let direction = 'inbound';

      if (targetNode.data?.nodeType === 'service') {
        nodeType = 'services';
        nodeName = targetNode.data?.service;
        byLabels = '&byLabels[]=source_workload';
      } else if (targetNode.data?.nodeType === 'serviceentry') {
        nodeType = 'workloads';
        nodeName = sourceNode.data?.workload;
        direction = 'outbound';
      }

      let filterKey = 'source_workload';
      let filterValue = sourceNode.data?.workload;
      if (sourceNode.data?.nodeType === 'service') {
        filterKey = 'destination_service_name';
        filterValue = sourceNode.data.service;
      } else if (targetNode.data?.nodeType === 'serviceentry') {
        filterKey = 'destination_service_name';
        filterValue =
          targetNode.data.isServiceEntry?.hosts && targetNode.data.isServiceEntry?.hosts.length > 0
            ? targetNode.data.isServiceEntry?.hosts[0]
            : '';
      }

      const response = await apiContext.client.get<IMetricsMap>(
        `/api/plugins/kiali/metrics?url=${encodeURIComponent(
          `/kiali/api/namespaces/${targetNode.data?.namespace}/${nodeType}/${nodeName}/metrics?queryTime=${
            times.timeEnd
          }&duration=${times.timeEnd - times.timeStart}${getStepAndRateIntervalParameters(
            times,
          )}&quantiles[]=0.5&quantiles[]=0.95&quantiles[]=0.99&filters[]=tcp_sent&filters[]=tcp_received${byLabels}&direction=${direction}&reporter=source`,
        )}`,
        {
          headers: {
            'x-kobs-cluster': instance.cluster,
            'x-kobs-plugin': instance.name,
          },
        },
      );

      if (!response) {
        return [];
      }

      const data: IChartData[] = [];

      if (response.tcp_received) {
        data.push(
          ...convertMetrics(response.tcp_received.filter((metric) => metric.labels[filterKey] === filterValue)),
        );
      }

      if (response.tcp_sent) {
        data.push(...convertMetrics(response.tcp_sent.filter((metric) => metric.labels[filterKey] === filterValue)));
      }

      return [
        {
          data: data,
          title: 'TCP Traffic',
          unit: 'B/s',
        },
      ];
    },
  );

  return (
    <UseQueryWrapper
      error={error}
      errorTitle="Failed to load metrics"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data || data.length === 0}
      noDataTitle="No metrics were found"
      refetch={refetch}
    >
      {data?.map((chart, index) => chart.data.length > 0 && <Chart key={index} times={times} chart={chart} />)}
    </UseQueryWrapper>
  );
};

const EdgeMetricsHTTP: FunctionComponent<{
  instance: IPluginInstance;
  sourceNode: INodeWrapper;
  targetNode: INodeWrapper;
  times: ITimes;
}> = ({ instance, times, sourceNode, targetNode }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<IChart[], APIError>(
    ['kiali/metrics/edge/http', instance, times, sourceNode, targetNode],
    async () => {
      if (targetNode.data?.namespace === 'unknown') {
        return [];
      }

      let nodeType = 'workloads';
      let nodeName = targetNode.data?.workload;
      let byLabels = '&byLabels[]=destination_service_name';
      let reporter = 'destination';

      if (targetNode.data?.nodeType === 'service') {
        nodeType = 'services';
        nodeName = targetNode.data?.service;
        byLabels = '&byLabels[]=source_workload';
        reporter = 'source';
      }

      if ((sourceNode.data, nodeType === 'unknown')) {
        reporter = 'destination';
      }

      let filterKey = 'source_workload';
      let filterValue = sourceNode.data?.workload;
      if (sourceNode.data?.workload === 'service') {
        filterKey = 'destination_service_name';
        filterValue = sourceNode.data?.service;
      }

      const response = await apiContext.client.get<IMetricsMap>(
        `/api/plugins/kiali/metrics?url=${encodeURIComponent(
          `/kiali/api/namespaces/${targetNode.data?.namespace}/${nodeType}/${nodeName}/metrics?queryTime=${
            times.timeEnd
          }&duration=${times.timeEnd - times.timeStart}${getStepAndRateIntervalParameters(
            times,
          )}&quantiles[]=0.5&quantiles[]=0.95&quantiles[]=0.99&filters[]=request_count&filters[]=request_duration_millis&filters[]=request_error_count${byLabels}&direction=inbound&reporter=${reporter}&requestProtocol=http`,
        )}`,
        {
          headers: {
            'x-kobs-cluster': instance.cluster,
            'x-kobs-plugin': instance.name,
          },
        },
      );

      if (!response) {
        return [];
      }

      const dataCount: IChartData[] = [];
      let dataTime: IChartData[] = [];

      if (response.request_count) {
        dataCount.push(
          ...convertMetrics(response.request_count.filter((metric) => metric.labels[filterKey] === filterValue)),
        );
      }

      if (response.request_error_count) {
        dataCount.push(
          ...convertMetrics(response.request_error_count.filter((metric) => metric.labels[filterKey] === filterValue)),
        );
      }

      if (response.request_duration_millis) {
        dataTime = convertMetrics(
          response.request_duration_millis.filter((metric) => metric.labels[filterKey] === filterValue),
        );
      }

      return [
        {
          data: dataCount,
          title: 'HTTP Requests per Second',
          unit: 'req/s',
        },
        {
          data: dataTime,
          title: 'HTTP Requests Response Time',
          unit: 'ms',
        },
      ];
    },
  );

  return (
    <UseQueryWrapper
      error={error}
      errorTitle="Failed to load metrics"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data || data.length === 0}
      noDataTitle="No metrics were found"
      refetch={refetch}
    >
      {data?.map((chart, index) => chart.data.length > 0 && <Chart key={index} times={times} chart={chart} />)}
    </UseQueryWrapper>
  );
};

const EdgeMetricsgRPC: FunctionComponent<{
  instance: IPluginInstance;
  sourceNode: INodeWrapper;
  targetNode: INodeWrapper;
  times: ITimes;
}> = ({ instance, times, sourceNode, targetNode }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<IChart[], APIError>(
    ['kiali/metrics/edge/grpc', instance, times, sourceNode, targetNode],
    async () => {
      if (targetNode.data?.namespace === 'unknown') {
        return [];
      }

      let nodeType = 'workloads';
      let nodeName = targetNode.data?.workload;
      let byLabels = '&byLabels[]=destination_service_name';
      let reporter = 'destination';

      if (targetNode.data?.nodeType === 'service') {
        nodeType = 'services';
        nodeName = targetNode.data?.service;
        byLabels = '&byLabels[]=source_workload';
        reporter = 'source';
      }

      if ((sourceNode.data, nodeType === 'unknown')) {
        reporter = 'destination';
      }

      let filterKey = 'source_workload';
      let filterValue = sourceNode.data?.workload;
      if (sourceNode.data?.workload === 'service') {
        filterKey = 'destination_service_name';
        filterValue = sourceNode.data?.service;
      }

      const response = await apiContext.client.get<IMetricsMap>(
        `/api/plugins/kiali/metrics?url=${encodeURIComponent(
          `/kiali/api/namespaces/${targetNode.data?.namespace}/${nodeType}/${nodeName}/metrics?queryTime=${
            times.timeEnd
          }&duration=${times.timeEnd - times.timeStart}${getStepAndRateIntervalParameters(
            times,
          )}&quantiles[]=0.5&quantiles[]=0.95&quantiles[]=0.99&filters[]=request_count&filters[]=request_duration_millis&filters[]=request_error_count${byLabels}&direction=inbound&reporter=${reporter}&requestProtocol=grpc`,
        )}`,
        {
          headers: {
            'x-kobs-cluster': instance.cluster,
            'x-kobs-plugin': instance.name,
          },
        },
      );

      if (!response) {
        return [];
      }

      const dataCount: IChartData[] = [];
      let dataTime: IChartData[] = [];

      if (response.request_count) {
        dataCount.push(
          ...convertMetrics(response.request_count.filter((metric) => metric.labels[filterKey] === filterValue)),
        );
      }

      if (response.request_error_count) {
        dataCount.push(
          ...convertMetrics(response.request_error_count.filter((metric) => metric.labels[filterKey] === filterValue)),
        );
      }

      if (response.request_duration_millis) {
        dataTime = convertMetrics(
          response.request_duration_millis.filter((metric) => metric.labels[filterKey] === filterValue),
        );
      }

      return [
        {
          data: dataCount,
          title: 'gRPC Requests per Second',
          unit: 'req/s',
        },
        {
          data: dataTime,
          title: 'gRPC Requests Response Time',
          unit: 'ms',
        },
      ];
    },
  );

  return (
    <UseQueryWrapper
      error={error}
      errorTitle="Failed to load metrics"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data || data.length === 0}
      noDataTitle="No metrics were found"
      refetch={refetch}
    >
      {data?.map((chart, index) => chart.data.length > 0 && <Chart key={index} times={times} chart={chart} />)}
    </UseQueryWrapper>
  );
};

export const Edge: FunctionComponent<{
  edge: IEdgeData;
  instance: IPluginInstance;
  nodes: INodeWrapper[];
  onClose: () => void;
  open: boolean;
  times: ITimes;
}> = ({ instance, times, edge, nodes, onClose, open }) => {
  const [activeTab, setActiveTab] = useState<string>(
    edge.traffic?.protocol === 'http' ? 'traffic' : edge.traffic?.protocol === 'grpc' ? 'traffic' : 'flags',
  );

  // To display the edge details like metrics, we have to get the source and target node of the edge. After that we,
  // generate the title for both nodes and display them in the format "From: ... To: ...".
  const sourceNode = nodes.filter((node) => node.data?.id === edge.source);
  const sourceTitle =
    sourceNode.length === 1 && sourceNode[0].data ? getTitle(sourceNode[0].data) : { badge: 'U', title: 'Unknown' };
  const targetNode = nodes.filter((node) => node.data?.id === edge.target);
  const targetTitle =
    targetNode.length === 1 && targetNode[0].data ? getTitle(targetNode[0].data) : { badge: 'U', title: 'Unknown' };

  return (
    <DetailsDrawer
      size="large"
      open={open}
      onClose={onClose}
      title={
        <Box>
          <Box component="span" sx={{ mr: 2 }}>
            From:
          </Box>
          <Chip sx={{ mr: 2 }} size="small" color="primary" label={sourceTitle.badge} />
          {sourceTitle.title}
          <Box component="span" sx={{ ml: 4, mr: 2 }}>
            To:
          </Box>
          <Chip sx={{ mr: 2 }} size="small" color="primary" label={targetTitle.badge} />
          {targetTitle.title}
        </Box>
      }
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs variant="scrollable" scrollButtons={false} value={activeTab} onChange={(_, value) => setActiveTab(value)}>
          {edge.traffic?.protocol === 'http' || edge.traffic?.protocol === 'grpc' ? (
            <Tab label="Traffic" value="traffic" />
          ) : null}
          <Tab label="Flags" value="flags" />
          <Tab label="Hosts" value="hosts" />
        </Tabs>
      </Box>
      {edge.traffic?.protocol === 'http' && (
        <Box hidden={activeTab !== 'traffic'} sx={{ pt: 6 }}>
          {activeTab === 'traffic' && <EdgeTrafficHTTP edge={edge} />}
        </Box>
      )}
      {edge.traffic?.protocol === 'grpc' && (
        <Box hidden={activeTab !== 'traffic'} sx={{ pt: 6 }}>
          {activeTab === 'traffic' && <EdgeTrafficGRPC edge={edge} />}
        </Box>
      )}
      <Box hidden={activeTab !== 'flags'} sx={{ pt: 6 }}>
        {activeTab === 'flags' && <EdgeFlags edge={edge} />}
      </Box>
      <Box hidden={activeTab !== 'hosts'} sx={{ pt: 6 }}>
        {activeTab === 'hosts' && <EdgeHosts edge={edge} />}
      </Box>

      {sourceNode.length === 1 && targetNode.length === 1 ? (
        edge.traffic?.protocol === 'tcp' ? (
          <EdgeMetricsTCP instance={instance} times={times} sourceNode={sourceNode[0]} targetNode={targetNode[0]} />
        ) : edge.traffic?.protocol === 'http' ? (
          <EdgeMetricsHTTP instance={instance} times={times} sourceNode={sourceNode[0]} targetNode={targetNode[0]} />
        ) : edge.traffic?.protocol === 'grpc' ? (
          <EdgeMetricsgRPC instance={instance} times={times} sourceNode={sourceNode[0]} targetNode={targetNode[0]} />
        ) : null
      ) : null}
    </DetailsDrawer>
  );
};
