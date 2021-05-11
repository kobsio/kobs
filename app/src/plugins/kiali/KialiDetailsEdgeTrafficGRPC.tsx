import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import React from 'react';

import { Edge } from 'proto/kiali_grpc_web_pb';

interface IRates {
  grpc: number;
  grpcPercentErr: number;
  grpcPercentSuc: number;
}

// getTableDataFromRates is used to generate the data for the traffic table. For that we have to get the rate and errors
// from the "grpc" and "grpcPercentErr" field in the rates map. The percent value for successfull calls is generated, by
// subtracting the percent value for the errors.
const getTableDataFromRates = (ratesMap: [string, string][]): IRates => {
  let grpc = 0;
  let grpcPercentErr = 0;

  for (const rate of ratesMap) {
    if (rate[0] === 'grpc') {
      grpc = parseFloat(rate[1]);
    } else if (rate[0] === 'grpcPercentErr') {
      grpcPercentErr = parseFloat(rate[1]);
    }
  }

  return {
    grpc: grpc,
    grpcPercentErr: grpcPercentErr,
    grpcPercentSuc: 100 - grpcPercentErr,
  };
};

interface IKialiDetailsEdgeTrafficGRPCProps {
  edge: Edge.AsObject;
}

// KialiDetailsEdgeTrafficGRPC is the component to display the traffic details for a grpc edge. This includes the rate
// and the percentage of successful and error calls.
const KialiDetailsEdgeTrafficGRPC: React.FunctionComponent<IKialiDetailsEdgeTrafficGRPCProps> = ({
  edge,
}: IKialiDetailsEdgeTrafficGRPCProps) => {
  const rates = edge.traffic?.ratesMap ? getTableDataFromRates(edge.traffic?.ratesMap) : undefined;

  return (
    <Card isCompact={true}>
      <CardTitle>GRPC requests per second</CardTitle>
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
                <Td dataLabel="Success (%)">{rates.grpcPercentSuc}</Td>
                <Td dataLabel="Error (%)">{rates.grpcPercentErr}</Td>
              </Tr>
            </Tbody>
          </TableComposable>
        ) : null}
      </CardBody>
    </Card>
  );
};

export default KialiDetailsEdgeTrafficGRPC;
