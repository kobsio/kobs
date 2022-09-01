import { Button, ButtonVariant } from '@patternfly/react-core';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import React from 'react';
import SquareIcon from '@patternfly/react-icons/dist/esm/icons/square-icon';

import { IDatum, ILegend, IMetrics } from '../../utils/interfaces';
import { getColor } from '@kobsio/shared';

const calcMin = (data: IDatum[], unit: string | undefined): string => {
  let min = 0;

  for (let i = 0; i < data.length; i++) {
    if (data[i].y) {
      if (i === 0) {
        min = data[i].y as number;
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (data[i].y! < min) {
        min = data[i].y as number;
      }
    }
  }

  return `${min} ${unit ? unit : ''}`;
};

const calcMax = (data: IDatum[], unit: string | undefined): string => {
  let max = 0;

  for (let i = 0; i < data.length; i++) {
    if (data[i].y) {
      if (i === 0) {
        max = data[i].y as number;
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (data[i].y! > max) {
        max = data[i].y as number;
      }
    }
  }

  return `${max} ${unit ? unit : ''}`;
};

const calcAvg = (data: IDatum[], unit: string | undefined): string => {
  let count = 0;
  let sum = 0;

  for (let i = 0; i < data.length; i++) {
    if (data[i].y) {
      count = count + 1;
      sum = sum + (data[i].y as number);
    }
  }

  return `${count > 0 ? sum / count : 0} ${unit ? unit : ''}`;
};

interface ISQLChartLineLegendProps {
  metrics: IMetrics[];
  yAxisUnit?: string;
  legend?: ILegend;
}

const SQLChartLineLegend: React.FunctionComponent<ISQLChartLineLegendProps> = ({
  metrics,
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
        {metrics.map((metric, index) => (
          <Tr key={metric.name}>
            <Td style={{ fontSize: '12px', padding: 0 }} dataLabel="Name">
              <Button
                style={{ color: 'inherit', cursor: 'inherit', textDecoration: 'inherit' }}
                variant={ButtonVariant.link}
                isInline={true}
                icon={<SquareIcon color={getColor(index)} />}
              >
                {legend && legend.hasOwnProperty(metric.name) ? legend[metric.name] : metric.name}
              </Button>
            </Td>
            <Td style={{ fontSize: '12px', padding: 0 }} dataLabel="Min">
              {calcMin(metric.data, yAxisUnit)}
            </Td>
            <Td style={{ fontSize: '12px', padding: 0 }} dataLabel="Max">
              {calcMax(metric.data, yAxisUnit)}
            </Td>
            <Td style={{ fontSize: '12px', padding: 0 }} dataLabel="Avg">
              {calcAvg(metric.data, yAxisUnit)}
            </Td>
            <Td style={{ fontSize: '12px', padding: 0 }} dataLabel="Current">
              {metric.data.length > 0
                ? `${metric.data[metric.data?.length - 1].y}${yAxisUnit ? ` ${yAxisUnit}` : ''}`
                : ''}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </TableComposable>
  );
};

export default SQLChartLineLegend;
