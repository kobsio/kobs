import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import React from 'react';

import { IEdgeWrapper, ITrafficHTTPRates } from '../../../utils/interfaces';

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

interface INodeTrafficHTTPProps {
  sourceEdges: IEdgeWrapper[];
  targetEdges: IEdgeWrapper[];
}

const NodeTrafficHTTP: React.FunctionComponent<INodeTrafficHTTPProps> = ({
  sourceEdges,
  targetEdges,
}: INodeTrafficHTTPProps) => {
  const httpIn = getEdgeTraffic(targetEdges);
  const httpOut = getEdgeTraffic(sourceEdges);

  if (httpIn.edges === 0 && httpOut.edges === 0) {
    return null;
  }

  return (
    <React.Fragment>
      <Card isCompact={true}>
        <CardTitle>HTTP Requests per Second</CardTitle>
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
                <Td dataLabel="Total">{httpIn.edges > 0 ? httpIn.rate : '-'}</Td>
                <Td dataLabel="Success (%)">{httpIn.edges > 0 ? 100 - httpIn.error : '-'}</Td>
                <Td dataLabel="Error (%)">{httpIn.edges > 0 ? httpIn.error : '-'}</Td>
              </Tr>
              <Tr>
                <Td>Out</Td>
                <Td dataLabel="Total">{httpOut.edges > 0 ? httpOut.rate : '-'}</Td>
                <Td dataLabel="Success (%)">{httpOut.edges > 0 ? 100 - httpOut.error : '-'}</Td>
                <Td dataLabel="Error (%)">{httpOut.edges > 0 ? httpOut.error : '-'}</Td>
              </Tr>
            </Tbody>
          </TableComposable>
        </CardBody>
      </Card>
      <p>&nbsp;</p>
    </React.Fragment>
  );
};

export default NodeTrafficHTTP;
