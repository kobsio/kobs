import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import React from 'react';

import { IEdgeData, ITrafficHTTPRates } from '../../../utils/interfaces';

interface IEdgeTrafficHTTPProps {
  edge: IEdgeData;
}

const EdgeTrafficHTTP: React.FunctionComponent<IEdgeTrafficHTTPProps> = ({ edge }: IEdgeTrafficHTTPProps) => {
  const rates = edge.traffic && edge.traffic.rates ? (edge.traffic.rates as ITrafficHTTPRates) : undefined;

  return (
    <Card isCompact={true}>
      <CardTitle>HTTP Requests per Second</CardTitle>
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
                <Td dataLabel="Total">{rates.http}</Td>
                <Td dataLabel="Success (%)">{rates.httpPercentErr ? 100 - parseFloat(rates.httpPercentErr) : 100}</Td>
                <Td dataLabel="Error (%)">{rates.httpPercentErr || 0}</Td>
              </Tr>
            </Tbody>
          </TableComposable>
        ) : null}
      </CardBody>
    </Card>
  );
};

export default EdgeTrafficHTTP;
