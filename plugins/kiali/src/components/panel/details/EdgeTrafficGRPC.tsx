import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import React from 'react';

import { IEdgeData, ITrafficGRPCRates } from '../../../utils/interfaces';

interface IEdgeTrafficGRPCProps {
  edge: IEdgeData;
}

const EdgeTrafficGRPC: React.FunctionComponent<IEdgeTrafficGRPCProps> = ({ edge }: IEdgeTrafficGRPCProps) => {
  const rates = edge.traffic && edge.traffic.rates ? (edge.traffic.rates as ITrafficGRPCRates) : undefined;

  return (
    <Card isCompact={true}>
      <CardTitle>gRPC Requests per Second</CardTitle>
      <CardBody>
        {rates ? (
          <TableComposable aria-label="Rates" variant={TableVariant.compact} borders={false}>
            <Thead>
              <Tr>
                <Th>Total</Th>
                <Th>Success (%)</Th>
                <Th>Error (%)</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td dataLabel="Total">{rates.grpc}</Td>
                <Td dataLabel="Success (%)">{rates.grpcPercentErr ? 100 - parseFloat(rates.grpcPercentErr) : 100}</Td>
                <Td dataLabel="Error (%)">{rates.grpcPercentErr || 0}</Td>
              </Tr>
            </Tbody>
          </TableComposable>
        ) : null}
      </CardBody>
    </Card>
  );
};

export default EdgeTrafficGRPC;
