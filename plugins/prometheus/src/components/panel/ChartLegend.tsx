import { Button, ButtonVariant } from '@patternfly/react-core';
import { EyeSlashIcon, SquareIcon } from '@patternfly/react-icons';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import React from 'react';
import { Serie } from '@nivo/line';

import { getColor } from '@kobsio/plugin-core';
import { roundNumber } from '../../utils/helpers';

interface IChartLegendProps {
  series: Serie[];
  unit: string;
  selected: Serie[];
  select: (color: string, serie: Serie) => void;
}

// The ChartLegend implements the legend for the line and area chart. Currently the only legend we are supporting is
// a table. The table also displays the min, max and avg value for each metric. When the user clicks on the name of a
// metric we toogle between this single metric and all metrics in the corresponding chart.
const ChartLegend: React.FunctionComponent<IChartLegendProps> = ({
  series,
  unit,
  selected,
  select,
}: IChartLegendProps) => {
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
        {series.map((metric, index) => (
          <Tr key={index}>
            <Td style={{ fontSize: '12px', padding: 0 }} dataLabel="Name">
              <Button
                className={selected.length === 1 && selected[0].label !== metric.label ? 'pf-u-color-400' : ''}
                style={{ color: 'inherit', textDecoration: 'inherit' }}
                variant={ButtonVariant.link}
                isInline={true}
                icon={
                  selected.length === 1 && selected[0].label !== metric.label ? (
                    <EyeSlashIcon />
                  ) : (
                    <SquareIcon color={getColor(index)} />
                  )
                }
                onClick={(): void => select(getColor(index), metric)}
              >
                {metric.label}
              </Button>
            </Td>
            <Td style={{ fontSize: '12px', padding: 0 }} dataLabel="Min">
              {roundNumber(metric.min)} {unit}
            </Td>
            <Td style={{ fontSize: '12px', padding: 0 }} dataLabel="Max">
              {roundNumber(metric.max)} {unit}
            </Td>
            <Td style={{ fontSize: '12px', padding: 0 }} dataLabel="Avg">
              {roundNumber(metric.avg)} {unit}
            </Td>
            <Td style={{ fontSize: '12px', padding: 0 }} dataLabel="Current">
              {metric.data[metric.data.length - 1].y
                ? `${roundNumber(metric.data[metric.data.length - 1].y as number)} ${unit}`
                : ''}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </TableComposable>
  );
};

export default ChartLegend;
