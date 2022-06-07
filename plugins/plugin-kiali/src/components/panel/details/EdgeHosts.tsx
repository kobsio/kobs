import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import React from 'react';

import { IEdgeData } from '../../../utils/interfaces';

interface IEdgeHostsProps {
  edge: IEdgeData;
}

// EdgeHosts is the tab content for the hosts tab of an edge. It is used to display a table of the responses grouped by
// the host.
const EdgeHosts: React.FunctionComponent<IEdgeHostsProps> = ({ edge }: IEdgeHostsProps) => {
  return (
    <Card isCompact={true}>
      <CardTitle>Hosts by HTTP Code</CardTitle>
      <CardBody>
        <TableComposable aria-label="Hosts" variant={TableVariant.compact} borders={false}>
          <Thead>
            <Tr>
              <Th>Code</Th>
              <Th>Host</Th>
              <Th>Req (%)</Th>
            </Tr>
          </Thead>
          <Tbody>
            {edge.traffic && edge.traffic.responses
              ? Object.keys(edge.traffic.responses).map((responseCode) =>
                  edge.traffic && edge.traffic.responses && edge.traffic.responses[responseCode].hosts
                    ? Object.keys(edge.traffic.responses[responseCode].hosts).map((host) => (
                        <Tr key={`${responseCode}_${host}`}>
                          <Td dataLabel="Code">{responseCode}</Td>
                          <Td dataLabel="Host">{host}</Td>
                          <Td dataLabel="Req (%)">{edge.traffic?.responses[responseCode].hosts[host]}</Td>
                        </Tr>
                      ))
                    : null,
                )
              : null}
          </Tbody>
        </TableComposable>
      </CardBody>
    </Card>
  );
};

export default EdgeHosts;
