import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import React from 'react';
import SquareIcon from '@patternfly/react-icons/dist/esm/icons/square-icon';

import { convertQueryResult, roundNumber } from '../../utils/helpers';
import { IQueryResult } from './interfaces';
import { getColor } from '@kobsio/shared';

const getCurrency = (data: IQueryResult, label: string): string => {
  const row = data.properties.rows.filter((row) => row[1] === label);

  if (row.length === 1) {
    return row[0][2];
  }

  return '';
};

interface ICostPieChartLegendProps {
  data: IQueryResult;
}

// The CostPieChartLegend implements the legend for the line and area chart. Currently the only legend we are supporting is
// a table. The table also displays the min, max and avg value for each metric. When the user clicks on the name of a
// metric we toogle between this single metric and all metrics in the corresponding chart.
const CostPieChartLegend: React.FunctionComponent<ICostPieChartLegendProps> = ({ data }: ICostPieChartLegendProps) => {
  const tableData = convertQueryResult(data);

  return (
    <TableComposable aria-label="Legend" variant={TableVariant.compact} borders={false}>
      <Thead>
        <Tr>
          <Th style={{ fontSize: '12px', padding: 0 }}>Scope</Th>
          <Th style={{ fontSize: '12px', padding: 0 }}>Value</Th>
        </Tr>
      </Thead>
      <Tbody>
        {tableData.map((row, index) => (
          <Tr key={index}>
            <Td style={{ fontSize: '12px', padding: 0 }} dataLabel="Scope">
              <SquareIcon color={getColor(index)} /> {row.label}
            </Td>
            <Td style={{ fontSize: '12px', padding: 0 }} dataLabel="Value">
              {roundNumber(row.value)} {getCurrency(data, row.label.toString())}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </TableComposable>
  );
};

export default CostPieChartLegend;
