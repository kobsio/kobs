import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import React from 'react';
import { V1Condition } from '@kubernetes/client-node';

interface IConditionsProps {
  conditions?: V1Condition[];
}

const Conditions: React.FunctionComponent<IConditionsProps> = ({ conditions }: IConditionsProps) => {
  return (
    <Card className="pf-u-mb-lg" isCompact={true}>
      <CardTitle>Conditions</CardTitle>
      <CardBody>
        <TableComposable aria-label="Conditions" variant={TableVariant.compact} borders={false}>
          <Thead>
            <Tr>
              <Th>Type</Th>
              <Th>Status</Th>
              <Th>Reason</Th>
              <Th>Message</Th>
            </Tr>
          </Thead>

          <Tbody>
            {conditions
              ? conditions
                  .filter((condition) => condition.status === 'True')
                  .map((condition, index) => (
                    <Tr key={index}>
                      <Td dataLabel="Type">{condition.type}</Td>
                      <Td dataLabel="Status">{condition.status}</Td>
                      <Td dataLabel="Reason">{condition.reason}</Td>
                      <Td dataLabel="Message">{condition.message}</Td>
                    </Tr>
                  ))
              : null}
          </Tbody>
        </TableComposable>
      </CardBody>
    </Card>
  );
};

export default Conditions;
