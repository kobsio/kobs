import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import React from 'react';

import { ISQLData } from '../../utils/interfaces';

type ISQLTableProps = ISQLData;

const SQLTable: React.FunctionComponent<ISQLTableProps> = ({ rows, columns }: ISQLTableProps) => {
  if (!columns || columns.length === 0) {
    return null;
  }

  return (
    <TableComposable aria-label="SQL Query Result" variant={TableVariant.compact} borders={false}>
      <Thead>
        <Tr>
          {columns.map((column, index) => (
            <Th key={index}>{column}</Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {rows
          ? rows.map((row, rowIndex) => (
              <Tr key={rowIndex}>
                {row.map((column, columnIndex) => (
                  <Td key={`${rowIndex}_${columnIndex}`}>{column}</Td>
                ))}
              </Tr>
            ))
          : null}
      </Tbody>
    </TableComposable>
  );
};

export default SQLTable;
