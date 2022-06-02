import { Button, ButtonVariant } from '@patternfly/react-core';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import React from 'react';
import { SquareIcon } from '@patternfly/react-icons';

import { ILegend, ISQLData, ISQLDataRow } from '../../utils/interfaces';
import { getColor } from '@kobsio/shared';

const calcMin = (column: string, rows: ISQLDataRow[] | undefined, unit: string | undefined): string => {
  if (!rows) {
    return '';
  }

  let min = 0;

  for (let i = 0; i < rows.length; i++) {
    if (i === 0) {
      min = rows[i][column] as number;
    }

    if (rows[i][column] < min) {
      min = rows[i][column] as number;
    }
  }

  return `${min} ${unit}`;
};

const calcMax = (column: string, rows: ISQLDataRow[] | undefined, unit: string | undefined): string => {
  if (!rows) {
    return '';
  }

  let max = 0;

  for (let i = 0; i < rows.length; i++) {
    if (i === 0) {
      max = rows[i][column] as number;
    }

    if (rows[i][column] > max) {
      max = rows[i][column] as number;
    }
  }

  return `${max} ${unit}`;
};

const calcAvg = (column: string, rows: ISQLDataRow[] | undefined, unit: string | undefined): string => {
  if (!rows) {
    return '';
  }

  let sum = 0;

  for (let i = 0; i < rows.length; i++) {
    sum = sum + (rows[i][column] as number);
  }

  return `${sum / rows.length} ${unit}`;
};

interface ISQLChartLineLegendProps {
  data: ISQLData;
  yAxisColumns: string[];
  yAxisUnit?: string;
  legend?: ILegend;
}

const SQLChartLineLegend: React.FunctionComponent<ISQLChartLineLegendProps> = ({
  data,
  yAxisColumns,
  yAxisUnit,
  legend,
}: ISQLChartLineLegendProps) => {
  return (
    <TableComposable aria-label="Legend" variant={TableVariant.compact} borders={false}>
      <Thead>
        <Tr>
          <Th style={{ fontSize: '12px', padding: 0 }}>Name</Th>
          <Th style={{ fontSize: '12px', padding: 0 }}>Min</Th>
          <Th style={{ fontSize: '12px', padding: 0 }}>Max</Th>
          <Th style={{ fontSize: '12px', padding: 0 }}>Avg</Th>
          <Th style={{ fontSize: '12px', padding: 0 }}>Current</Th>
        </Tr>
      </Thead>
      <Tbody>
        {yAxisColumns.map((column, index) => (
          <Tr key={index}>
            <Td style={{ fontSize: '12px', padding: 0 }} dataLabel="Name">
              <Button
                style={{ color: 'inherit', cursor: 'inherit', textDecoration: 'inherit' }}
                variant={ButtonVariant.link}
                isInline={true}
                icon={<SquareIcon color={getColor(index)} />}
              >
                {legend && legend.hasOwnProperty(column) ? legend[column] : column}
              </Button>
            </Td>
            <Td style={{ fontSize: '12px', padding: 0 }} dataLabel="Min">
              {calcMin(column, data.rows, yAxisUnit)}
            </Td>
            <Td style={{ fontSize: '12px', padding: 0 }} dataLabel="Max">
              {calcMax(column, data.rows, yAxisUnit)}
            </Td>
            <Td style={{ fontSize: '12px', padding: 0 }} dataLabel="Avg">
              {calcAvg(column, data.rows, yAxisUnit)}
            </Td>
            <Td style={{ fontSize: '12px', padding: 0 }} dataLabel="Current">
              {data.rows && data.rows[data.rows?.length - 1].hasOwnProperty(column)
                ? `${data.rows[data.rows?.length - 1][column]} ${yAxisUnit}`
                : ''}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </TableComposable>
  );
};

export default SQLChartLineLegend;
