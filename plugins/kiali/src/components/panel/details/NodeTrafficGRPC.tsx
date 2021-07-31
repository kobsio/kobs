import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import React from 'react';

import { IEdgeWrapper, ITrafficGRPCRates } from '../../../utils/interfaces';

interface IEdgeTraffic {
  edges: number;
  error: number;
  rate: number;
}

const getEdgeTraffic = (edges: IEdgeWrapper[]): IEdgeTraffic => {
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

interface INodeTrafficGRPCProps {
  sourceEdges: IEdgeWrapper[];
  targetEdges: IEdgeWrapper[];
}

const NodeTrafficGRPC: React.FunctionComponent<INodeTrafficGRPCProps> = ({
  sourceEdges,
  targetEdges,
}: INodeTrafficGRPCProps) => {
  const grpcIn = getEdgeTraffic(targetEdges);
  const grpcOut = getEdgeTraffic(sourceEdges);

  if (grpcIn.edges === 0 && grpcOut.edges === 0) {
    return null;
  }

  return (
    <React.Fragment>
      <Card isCompact={true}>
        <CardTitle>gRPC Requests per Second</CardTitle>
        <CardBody>
          <TableComposable aria-label="Rates" variant={TableVariant.compact} borders={false}>
            <Thead>
              <Tr>
                <Th></Th>
                <Th>Total</Th>
                <Th>Success (%)</Th>
                <Th>Error (%)</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>In</Td>
                <Td dataLabel="Total">{grpcIn.edges > 0 ? grpcIn.rate : '-'}</Td>
                <Td dataLabel="Success (%)">{grpcIn.edges > 0 ? 100 - grpcIn.error : '-'}</Td>
                <Td dataLabel="Error (%)">{grpcIn.edges > 0 ? grpcIn.error : '-'}</Td>
              </Tr>
              <Tr>
                <Td>Out</Td>
                <Td dataLabel="Total">{grpcOut.edges > 0 ? grpcOut.rate : '-'}</Td>
                <Td dataLabel="Success (%)">{grpcOut.edges > 0 ? 100 - grpcOut.error : '-'}</Td>
                <Td dataLabel="Error (%)">{grpcOut.edges > 0 ? grpcOut.error : '-'}</Td>
              </Tr>
            </Tbody>
          </TableComposable>
        </CardBody>
      </Card>
      <p>&nbsp;</p>
    </React.Fragment>
  );
};

export default NodeTrafficGRPC;
