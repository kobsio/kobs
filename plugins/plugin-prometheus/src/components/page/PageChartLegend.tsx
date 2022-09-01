import { Button, ButtonVariant } from '@patternfly/react-core';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import EyeSlashIcon from '@patternfly/react-icons/dist/esm/icons/eye-slash-icon';
import React from 'react';
import SquareIcon from '@patternfly/react-icons/dist/esm/icons/square-icon';

import { IMetric } from '../../utils/interfaces';
import { getColor } from '@kobsio/shared';
import { roundNumber } from '../../utils/helpers';

interface IPageChartLegendProps {
  queries: string[];
  metrics: IMetric[];
  selected: number;
  select: (index: number) => void;
}

// The PageChartLegend component renders the legend for the returned metrics. The legend is displayed in a table format
// and also includes the min, max and avg value for a metric. When the user clicks on a row he can add / remove a metric
// from the selected metrics. We then only display the selected metrics in the chart.
const PageChartLegend: React.FunctionComponent<IPageChartLegendProps> = ({
  queries,
  metrics,
  selected,
  select,
}: IPageChartLegendProps) => {
  return (
    <TableComposable aria-label="Legend" variant={TableVariant.compact} borders={false}>
      <Thead>
        <Tr>
          <Th>Name</Th>
          <Th>Min</Th>
          <Th>Max</Th>
          <Th>Avg</Th>
          <Th>Current</Th>
        </Tr>
      </Thead>
      <Tbody>
        {metrics.map((metric, index) => (
          <Tr key={index}>
            <Td dataLabel="Name">
              <Button
                className={selected === index || selected === -1 ? '' : 'pf-u-color-400'}
                style={{ color: 'inherit', textDecoration: 'inherit' }}
                variant={ButtonVariant.link}
                isInline={true}
                icon={selected === index || selected === -1 ? <SquareIcon color={getColor(index)} /> : <EyeSlashIcon />}
                onClick={(): void => select(index)}
              >
                {metric.label === '{}' && metrics.length === queries.length ? queries[index] : metric.label}
              </Button>
            </Td>
            <Td dataLabel="Min">{roundNumber(metric.min)}</Td>
            <Td dataLabel="Max">{roundNumber(metric.max)}</Td>
            <Td dataLabel="Avg">{roundNumber(metric.avg)}</Td>
            <Td dataLabel="Current">{roundNumber(metric.data[metric.data.length - 1].y as number)}</Td>
          </Tr>
        ))}
      </Tbody>
    </TableComposable>
  );
};

export default PageChartLegend;
