import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import React from 'react';

import { Edge } from 'proto/kiali_grpc_web_pb';

interface IKialiDetailsEdgeFlagsProps {
  edge: Edge.AsObject;
}

// KialiDetailsEdgeFlags is the tab content for the flags tab of an edge. It is used to display a table of the responses
// grouped by the flag.
const KialiDetailsEdgeFlags: React.FunctionComponent<IKialiDetailsEdgeFlagsProps> = ({
  edge,
}: IKialiDetailsEdgeFlagsProps) => {
  return (
    <Card isCompact={true}>
      <CardTitle>Response flags by HTTP code</CardTitle>
      <CardBody>
        <TableComposable aria-label="Flags" variant={TableVariant.compact} borders={false}>
          <Thead>
            <Tr>
              <Th>Code</Th>
              <Th>Flags</Th>
              <Th>Req (%)</Th>
            </Tr>
          </Thead>
          <Tbody>
            {edge.traffic?.responsesMap.map((response, i) =>
              response[1].flagsMap.map((flag, j) => (
                <Tr key={`${i}_${j}`}>
                  <Td dataLabel="Code">{response[0]}</Td>
                  <Td dataLabel="Flags">{flag[0]}</Td>
                  <Td dataLabel="Req (%)">{flag[1]}</Td>
                </Tr>
              )),
            )}
          </Tbody>
        </TableComposable>
      </CardBody>
    </Card>
  );
};

export default KialiDetailsEdgeFlags;
