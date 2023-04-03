import { roundNumber } from '@kobsio/core';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import React from 'react';

import { IDatum, ILegend, IMetrics } from './types';

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

  return `${count > 0 ? roundNumber(sum / count, 2) : 0} ${unit ? unit : ''}`;
};

interface ISQLChartGenericLegendProps {
  legend?: ILegend;
  metrics: IMetrics[];
  yAxisUnit?: string;
}

const SQLChartGenericLegend: React.FunctionComponent<ISQLChartGenericLegendProps> = ({
  metrics,
  yAxisUnit,
  legend,
}: ISQLChartGenericLegendProps) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Min</TableCell>
            <TableCell>Max</TableCell>
            <TableCell>Avg</TableCell>
            <TableCell>Current</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {metrics.map((metric, index) => (
            <TableRow key={metric.name}>
              <TableCell style={{ fontSize: '12px', padding: 0 }} aria-label="Name">
                {/* <Button
                style={{ color: 'inherit', cursor: 'inherit', textDecoration: 'inherit' }}
                variant={ButtonVariant.link}
                isInline={true}
                icon={<SquareIcon color={getColor(index)} />}
              >
                {}
              </Button> */}
                {legend && legend.hasOwnProperty(metric.name) ? legend[metric.name] : metric.name}
              </TableCell>
              <TableCell style={{ fontSize: '12px', padding: 0 }} aria-label="Min">
                {calcMin(metric.data, yAxisUnit)}
              </TableCell>
              <TableCell style={{ fontSize: '12px', padding: 0 }} aria-label="Max">
                {calcMax(metric.data, yAxisUnit)}
              </TableCell>
              <TableCell style={{ fontSize: '12px', padding: 0 }} aria-label="Avg">
                {calcAvg(metric.data, yAxisUnit)}
              </TableCell>
              <TableCell style={{ fontSize: '12px', padding: 0 }} aria-label="Current">
                {metric.data.length > 0
                  ? `${metric.data[metric.data?.length - 1].y}${yAxisUnit ? ` ${yAxisUnit}` : ''}`
                  : ''}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SQLChartGenericLegend;
