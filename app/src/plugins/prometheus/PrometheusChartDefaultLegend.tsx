import { Button, ButtonVariant } from '@patternfly/react-core';
import { ChartThemeColor, getDarkThemeColors } from '@patternfly/react-charts';
import { EyeSlashIcon, SquareIcon } from '@patternfly/react-icons';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import React from 'react';

import { Metrics } from 'proto/prometheus_grpc_web_pb';

// colors is an array with all the supported colors for a chart. These are the same colors as they are used for the
// bars, lines, areas in a chart.
export const colors = getDarkThemeColors(ChartThemeColor.multiOrdered).area.colorScale;

// getLegendColorClass returns the color class for an item in the legend. When we have more series then colors, we start
// again with the first color.
const getLegendColorClass = (index: number): string => {
  return colors[index % colors.length];
};

interface ILegendItem {
  childName: string;
  name: string;
}

export interface IPrometheusChartDefaultLegendProps {
  legend: string;
  legendData: ILegendItem[];
  metrics: Metrics.AsObject[];
  hiddenMetrics: string[];
  toogleMetric: (index: string) => void;
}

//
const PrometheusChartDefaultLegend: React.FunctionComponent<IPrometheusChartDefaultLegendProps> = ({
  legend,
  legendData,
  metrics,
  hiddenMetrics,
  toogleMetric,
}: IPrometheusChartDefaultLegendProps) => {
  if (legend === 'disabled') {
    return null;
  }

  if (legend === 'table') {
    return (
      <div className="pf-u-mt-md" style={{ height: '80px', overflow: 'scroll' }}>
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
            {legendData.map((legend, index) => (
              <Tr key={index}>
                <Td dataLabel="Name" style={{ fontSize: '12px', padding: 0 }}>
                  <Button
                    className={hiddenMetrics.includes(legend.childName) ? 'pf-u-color-400' : ''}
                    style={{ color: 'inherit', textDecoration: 'inherit' }}
                    variant={ButtonVariant.link}
                    isInline={true}
                    icon={
                      hiddenMetrics.includes(legend.childName) ? (
                        <EyeSlashIcon />
                      ) : (
                        <SquareIcon color={getLegendColorClass(index)} />
                      )
                    }
                    onClick={(): void => toogleMetric(legend.childName)}
                  >
                    {legend.name}
                  </Button>
                </Td>
                <Td dataLabel="Min" style={{ fontSize: '12px', padding: 0 }}>
                  {metrics[index].min}
                </Td>
                <Td dataLabel="Max" style={{ fontSize: '12px', padding: 0 }}>
                  {metrics[index].max}
                </Td>
                <Td dataLabel="Avg" style={{ fontSize: '12px', padding: 0 }}>
                  {metrics[index].avg}
                </Td>
                <Td dataLabel="Current" style={{ fontSize: '12px', padding: 0 }}>
                  {metrics[index].dataList[metrics[index].dataList.length - 1].y}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </TableComposable>
      </div>
    );
  }

  return (
    <div className="pf-u-mt-md pf-u-text-align-center" style={{ height: '50px', overflow: 'scroll' }}>
      {legendData.map((legend, index) => (
        <Button
          key={index}
          className={`pf-u-mx-md pf-u-font-size-xs ${hiddenMetrics.includes(legend.childName) ? 'pf-u-color-400' : ''}`}
          style={{ color: 'inherit', textDecoration: 'inherit' }}
          variant={ButtonVariant.link}
          isInline={true}
          icon={
            hiddenMetrics.includes(legend.childName) ? (
              <EyeSlashIcon />
            ) : (
              <SquareIcon color={getLegendColorClass(index)} />
            )
          }
          onClick={(): void => toogleMetric(legend.childName)}
        >
          {legend.name}
        </Button>
      ))}
    </div>
  );
};

export default PrometheusChartDefaultLegend;
