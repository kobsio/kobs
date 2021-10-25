import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import React from 'react';

import { ISQLData } from '../../utils/interfaces';
import { renderCellValue } from '../../utils/helpers';

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
        {rows && rows.length > 0
          ? rows.map((row, rowIndex) => (
              <Tr key={rowIndex}>
                {columns.map((column, columnIndex) => (
                  <Td key={`${rowIndex}_${columnIndex}`}>
                    {row.hasOwnProperty(column) ? renderCellValue(row[column]) : ''}
                  </Td>
                ))}
              </Tr>
            ))
          : null}
      </Tbody>
    </TableComposable>
  );
};

export default SQLTable;
