import { Button, ButtonVariant } from '@patternfly/react-core';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import EyeSlashIcon from '@patternfly/react-icons/dist/esm/icons/eye-slash-icon';
import React from 'react';
import SquareIcon from '@patternfly/react-icons/dist/esm/icons/square-icon';

import { IMetric } from '../../utils/interfaces';
import { getColor } from '@kobsio/shared';
import { roundNumber } from '../../utils/helpers';

interface IPanelChartLegendProps {
  metrics: IMetric[];
  unit: string;
  selected: number;
  select: (index: number) => void;
}

const PanelChartLegend: React.FunctionComponent<IPanelChartLegendProps> = ({
  metrics,
  unit,
  selected,
  select,
}: IPanelChartLegendProps) => {
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
          <Tr key={index}>
            <Td style={{ fontSize: '12px', padding: 0 }} dataLabel="Name">
              <Button
                className={selected === index || selected === -1 ? '' : 'pf-u-color-400'}
                style={{ color: 'inherit', textDecoration: 'inherit' }}
                variant={ButtonVariant.link}
                isInline={true}
                icon={selected === index || selected === -1 ? <SquareIcon color={getColor(index)} /> : <EyeSlashIcon />}
                onClick={(): void => select(index)}
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

export default PanelChartLegend;
