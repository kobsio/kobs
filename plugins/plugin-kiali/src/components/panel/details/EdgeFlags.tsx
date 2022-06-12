import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import React from 'react';

import { IEdgeData } from '../../../utils/interfaces';

interface IKialiDetailsEdgeFlagsProps {
  edge: IEdgeData;
}

// KialiDetailsEdgeFlags is the tab content for the flags tab of an edge. It is used to display a table of the responses
// grouped by the flag.
const KialiDetailsEdgeFlags: React.FunctionComponent<IKialiDetailsEdgeFlagsProps> = ({
  edge,
}: IKialiDetailsEdgeFlagsProps) => {
  return (
    <Card isCompact={true}>
      <CardTitle>Flags by HTTP Code</CardTitle>
      <CardBody>
        <TableComposable aria-label="Flags" variant={TableVariant.compact} borders={false}>
          <Thead>
            <Tr>
              <Th>Code</Th>
              <Th>Flag</Th>
              <Th>Req (%)</Th>
            </Tr>
          </Thead>
          <Tbody>
            {edge.traffic && edge.traffic.responses
              ? Object.keys(edge.traffic.responses).map((responseCode) =>
                  edge.traffic && edge.traffic.responses && edge.traffic.responses[responseCode].flags
                    ? Object.keys(edge.traffic.responses[responseCode].flags).map((flag) => (
                        <Tr key={`${responseCode}_${flag}`}>
                          <Td dataLabel="Code">{responseCode}</Td>
                          <Td dataLabel="Flag">{flag}</Td>
                          <Td dataLabel="Req (%)">{edge.traffic?.responses[responseCode].flags[flag]}</Td>
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

export default KialiDetailsEdgeFlags;
