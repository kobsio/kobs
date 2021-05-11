import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import React from 'react';

import { Edge } from 'proto/kiali_grpc_web_pb';

interface IKialiDetailsEdgeHostsProps {
  edge: Edge.AsObject;
}

// KialiDetailsEdgeHosts is the tab content for the hosts tab of an edge. It is used to display a table of the responses
// grouped by the host.
const KialiDetailsEdgeHosts: React.FunctionComponent<IKialiDetailsEdgeHostsProps> = ({
  edge,
}: IKialiDetailsEdgeHostsProps) => {
  return (
    <Card isCompact={true}>
      <CardTitle>Hosts by HTTP code</CardTitle>
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
            {edge.traffic?.responsesMap.map((response, i) =>
              response[1].hostsMap.map((host, j) => (
                <Tr key={`${i}_${j}`}>
                  <Td dataLabel="Code">{response[0]}</Td>
                  <Td dataLabel="Host">{host[0]}</Td>
                  <Td dataLabel="Req (%)">{host[1]}</Td>
                </Tr>
              )),
            )}
          </Tbody>
        </TableComposable>
      </CardBody>
    </Card>
  );
};

export default KialiDetailsEdgeHosts;
