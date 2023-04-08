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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext } from 'react';

import Chart from './Chart';

import {
  IEdgeWrapper,
  INodeData,
  INodeWrapper,
  ITrafficGRPCRates,
  ITrafficHTTPRates,
  IChart,
  getStepAndRateIntervalParameters,
  IMetricsMap,
  convertMetrics,
  IChartData,
} from '../utils/utils';

/**
 * `getTitle` returns the title of a node for the details view. The title contains a name (title) and a badge, which is
 * used to display the node type. The node type can be SE (ServiceEntry), S (Service) or A (Application).
 */
const getTitle = (node: INodeData): { badge: string; title: string } => {
  if (node.nodeType === 'serviceentry') {
    return { badge: 'SE', title: node.nodeLabel };
  } else if (node.nodeType === 'service') {
    return { badge: 'S', title: node.service || '' };
  }

  return { badge: 'A', title: node.app || '' };
};

const getEdges = (
  node: INodeData,
  nodes: INodeWrapper[],
  edges: IEdgeWrapper[],
): { source: IEdgeWrapper[]; target: IEdgeWrapper[] } => {
  if (node.nodeType === 'box') {
    const childrens = nodes
      .filter((children) => children.data?.parent === node.id)
      .map((children) => children.data?.id || '');

    return {
      source: edges.filter((edge) => edge.data && childrens.includes(edge.data.source)),
      target: edges.filter((edge) => edge.data && childrens.includes(edge.data.target)),
    };
  }

  return {
    source: edges.filter((edge) => edge.data?.source === node.id),
    target: edges.filter((edge) => edge.data?.target === node.id),
  };
};

/**
 * `getEdgeTrafficHTTP` returns the traffic for the given edges for the `NodeTrafficHTTP` component. The returned
 * metrics are containing the number of edges, the total error rate and the total traffic rate.
 */
const getEdgeTrafficHTTP = (edges: IEdgeWrapper[]): { edges: number; error: number; rate: number } => {
  let edgesCount = 0;
  let error = 0;
  let rate = 0;

  for (const edge of edges) {
    if (edge.data && edge.data.traffic && edge.data.traffic.protocol === 'http') {
      if (edge.data.traffic.rates) {
        const rates = edge.data.traffic.rates as ITrafficHTTPRates;
        edgesCount = edgesCount + 1;
        error = error + (rates && rates.httpPercentErr ? parseFloat(rates.httpPercentErr) : 0);
        rate = rate + parseFloat(rates.http);
      }
    }
  }

  return {
    edges: edgesCount,
    error: error,
    rate: rate,
  };
};

/**
 * `getEdgeTrafficHTTP` returns the traffic for the given edges for the `NodeTrafficGRPC` component. The returned
 * metrics are containing the number of edges, the total error rate and the total traffic rate.
 */
const getEdgeTrafficGRPC = (edges: IEdgeWrapper[]): { edges: number; error: number; rate: number } => {
  let edgesCount = 0;
  let error = 0;
  let rate = 0;

  for (const edge of edges) {
    if (edge.data && edge.data.traffic && edge.data.traffic.protocol === 'grpc') {
      if (edge.data.traffic.rates) {
        const rates = edge.data.traffic.rates as ITrafficGRPCRates;
        edgesCount = edgesCount + 1;
        error = error + (rates && rates.grpcPercentErr ? parseFloat(rates.grpcPercentErr) : 0);
        rate = rate + parseFloat(rates.grpc);
      }
    }
  }

  return {
    edges: edgesCount,
    error: error,
    rate: rate,
  };
};

const getTCPChart = (nodeType: string, direction: string, metrics: IMetricsMap): IChart => {
  const data: IChartData[] = [];
  let title = '';

  if (metrics.tcp_received) {
    data.push(...convertMetrics(metrics.tcp_received));
  }

  if (metrics.tcp_sent) {
    data.push(...convertMetrics(metrics.tcp_sent));
  }

  if (nodeType === 'services') {
    title = 'TCP Traffic';
  } else {
    if (direction === 'inbound') {
      title = 'TCP Inbound Traffic';
    } else if (direction === 'outbound') {
      title = 'TCP Outbound Traffic';
    }
  }

  return {
    data: data,
    title: title,
    unit: 'B/s',
  };
};

const getHTTPgRPCChart = (
  nodeType: string,
  direction: string,
  requestProtocol: string,
  metrics: IMetricsMap,
): IChart => {
  const data: IChartData[] = [];
  let title = '';

  if (metrics.request_count) {
    data.push(
      ...convertMetrics(
        metrics.request_count.filter((metric) => metric.labels['request_protocol'] === requestProtocol),
      ),
    );
  }

  if (metrics.request_error_count) {
    data.push(
      ...convertMetrics(
        metrics.request_error_count.filter((metric) => metric.labels['request_protocol'] === requestProtocol),
      ),
    );
  }

  if (nodeType === 'services') {
    title = `${requestProtocol === 'http' ? 'HTTP' : 'gRPC'} Requests per Second`;
  } else {
    if (direction === 'inbound') {
      title = `${requestProtocol === 'http' ? 'HTTP' : 'gRPC'} Inbound Requests per Second`;
    } else if (direction === 'outbound') {
      title = `${requestProtocol === 'http' ? 'HTTP' : 'gRPC'} Outbound Requests per Second`;
    }
  }

  return {
    data: data,
    title: title,
    unit: 'req/s',
  };
};

const NodeMetrics: FunctionComponent<{
  byLabels: string;
  direction: string;
  filters: string;
  instance: IPluginInstance;
  nodeName: string;
  nodeNamespace: string;
  nodeType: string;
  reporter: string;
  times: ITimes;
}> = ({ instance, times, nodeNamespace, nodeType, nodeName, filters, byLabels, direction, reporter }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<IChart[], APIError>(
    ['kiali/metrics/node', instance, times, nodeNamespace, nodeType, nodeName, filters, byLabels, direction, reporter],
    async () => {
      const response = await apiContext.client.get<IMetricsMap>(
        `/api/plugins/kiali/metrics?url=${encodeURIComponent(
          `/kiali/api/namespaces/${nodeNamespace}/${nodeType}/${nodeName}/metrics?queryTime=${times.timeEnd}&duration=${
            times.timeEnd - times.timeStart
          }${getStepAndRateIntervalParameters(times)}${filters}${byLabels}&direction=${direction}&reporter=${reporter}`,
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

      return [
        getTCPChart(nodeType, direction, response),
        getHTTPgRPCChart(nodeType, direction, 'http', response),
        getHTTPgRPCChart(nodeType, direction, 'grpc', response),
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

const NodeTrafficGRPC: FunctionComponent<{
  sourceEdges: IEdgeWrapper[];
  targetEdges: IEdgeWrapper[];
}> = ({ sourceEdges, targetEdges }) => {
  const grpcIn = getEdgeTrafficGRPC(targetEdges);
  const grpcOut = getEdgeTrafficGRPC(sourceEdges);

  if (grpcIn.edges === 0 && grpcOut.edges === 0) {
    return null;
  }

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h6" pb={2}>
          gRPC Requests per Second
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Success (%)</TableCell>
                <TableCell>Error (%)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>In</TableCell>
                <TableCell>{grpcIn.edges > 0 ? grpcIn.rate : '-'}</TableCell>
                <TableCell>{grpcIn.edges > 0 ? 100 - grpcIn.error : '-'}</TableCell>
                <TableCell>{grpcIn.edges > 0 ? grpcIn.error : '-'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Out</TableCell>
                <TableCell>{grpcOut.edges > 0 ? grpcOut.rate : '-'}</TableCell>
                <TableCell>{grpcOut.edges > 0 ? 100 - grpcOut.error : '-'}</TableCell>
                <TableCell>{grpcOut.edges > 0 ? grpcOut.error : '-'}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

const NodeTrafficHTTP: FunctionComponent<{
  sourceEdges: IEdgeWrapper[];
  targetEdges: IEdgeWrapper[];
}> = ({ sourceEdges, targetEdges }) => {
  const httpIn = getEdgeTrafficHTTP(targetEdges);
  const httpOut = getEdgeTrafficHTTP(sourceEdges);

  if (httpIn.edges === 0 && httpOut.edges === 0) {
    return null;
  }

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h6" pb={2}>
          HTTP Requests per Second
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Success (%)</TableCell>
                <TableCell>Error (%)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>In</TableCell>
                <TableCell>{httpIn.edges > 0 ? httpIn.rate : '-'}</TableCell>
                <TableCell>{httpIn.edges > 0 ? 100 - httpIn.error : '-'}</TableCell>
                <TableCell>{httpIn.edges > 0 ? httpIn.error : '-'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Out</TableCell>
                <TableCell>{httpOut.edges > 0 ? httpOut.rate : '-'}</TableCell>
                <TableCell>{httpOut.edges > 0 ? 100 - httpOut.error : '-'}</TableCell>
                <TableCell>{httpOut.edges > 0 ? httpOut.error : '-'}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export const Node: FunctionComponent<{
  edges: IEdgeWrapper[];
  instance: IPluginInstance;
  node: INodeData;
  nodes: INodeWrapper[];
  onClose: () => void;
  open: boolean;
  times: ITimes;
}> = ({ instance, times, node, edges, nodes, onClose, open }) => {
  const title = getTitle(node);
  const filteredEdges = getEdges(node, nodes, edges);

  return (
    <DetailsDrawer
      size="large"
      open={open}
      onClose={onClose}
      title={
        <Box>
          <Chip sx={{ mr: 2 }} size="small" color="primary" label={title.badge} />
          {title.title}
        </Box>
      }
    >
      <NodeTrafficHTTP sourceEdges={filteredEdges.source} targetEdges={filteredEdges.target} />
      <NodeTrafficGRPC sourceEdges={filteredEdges.source} targetEdges={filteredEdges.target} />
      {node.nodeType === 'app' ? (
        <>
          <NodeMetrics
            instance={instance}
            times={times}
            nodeNamespace={node.namespace}
            nodeType="workloads"
            nodeName={node.workload || ''}
            filters="&filters[]=request_count&filters[]=request_error_count&filters[]=tcp_sent&filters[]=tcp_received"
            byLabels="&byLabels[]=request_protocol"
            direction="outbound"
            reporter="source"
          />
          <NodeMetrics
            instance={instance}
            times={times}
            nodeNamespace={node.namespace}
            nodeType="workloads"
            nodeName={node.workload || ''}
            filters="&filters[]=request_count&filters[]=request_error_count"
            byLabels="&byLabels[]=request_protocol"
            direction="inbound"
            reporter="destination"
          />
          <NodeMetrics
            instance={instance}
            times={times}
            nodeNamespace={node.namespace}
            nodeType="workloads"
            nodeName={node.workload || ''}
            filters="&filters[]=tcp_sent&filters[]=tcp_received"
            byLabels=""
            direction="inbound"
            reporter="source"
          />
        </>
      ) : node.nodeType === 'service' ? (
        <>
          <NodeMetrics
            instance={instance}
            times={times}
            nodeNamespace={node.namespace}
            nodeType="services"
            nodeName={node.service || ''}
            filters="&filters[]=request_count&filters[]=request_error_count"
            byLabels="&byLabels[]=request_protocol"
            direction="inbound"
            reporter="destination"
          />
          <NodeMetrics
            instance={instance}
            times={times}
            nodeNamespace={node.namespace}
            nodeType="services"
            nodeName={node.service || ''}
            filters="&filters[]=tcp_sent&filters[]=tcp_received"
            byLabels=""
            direction="inbound"
            reporter="source"
          />
        </>
      ) : node.nodeType === 'box' ? (
        <>
          <NodeMetrics
            instance={instance}
            times={times}
            nodeNamespace={node.namespace}
            nodeType="apps"
            nodeName={node.app || ''}
            filters="&filters[]=request_count&filters[]=request_error_count&filters[]=tcp_sent&filters[]=tcp_received"
            byLabels="&byLabels[]=request_protocol"
            direction="outbound"
            reporter="source"
          />
          <NodeMetrics
            instance={instance}
            times={times}
            nodeNamespace={node.namespace}
            nodeType="apps"
            nodeName={node.app || ''}
            filters="&filters[]=request_count&filters[]=request_error_count&filters[]=tcp_sent&filters[]=tcp_received"
            byLabels="&byLabels[]=request_protocol"
            direction="inbound"
            reporter="destination"
          />
        </>
      ) : null}
    </DetailsDrawer>
  );
};
