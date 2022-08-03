import { Flex, FlexItem } from '@patternfly/react-core';
import React from 'react';

import { ILegend, ISQLData, IThresholds } from '../../utils/interfaces';

const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        b: parseInt(result[3], 16),
        g: parseInt(result[2], 16),
        r: parseInt(result[1], 16),
      }
    : {
        b: 204,
        g: 102,
        r: 0,
      };
};

const getBackgroundColor = (value: string | number | string[] | number[], thresholds?: IThresholds): string => {
  if (!thresholds) {
    return 'rgba(0, 102, 204, 0.2)';
  }

  let num = 0;
  if (typeof value === 'string') {
    num = parseFloat(value);
  } else if (typeof value === 'number') {
    num = value;
  } else {
    return 'rgba(0, 102, 204, 0.2)';
  }

  const orderedThresholds: number[] = Object.keys(thresholds)
    .map((key) => parseFloat(key))
    .sort()
    .reverse();

  for (const threshold of orderedThresholds) {
    if (num > threshold) {
      const rgb = hexToRgb(thresholds[threshold]);
      return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`;
    }
  }

  return 'rgba(0, 102, 204, 0.2)';
};

interface ISQLChartSinglestatsProps {
  data: ISQLData;
  yAxisColumns: string[];
  yAxisUnit?: string;
  legend?: ILegend;
  thresholds?: IThresholds;
}

export const SQLChartSinglestats: React.FunctionComponent<ISQLChartSinglestatsProps> = ({
  data,
  yAxisColumns,
  yAxisUnit,
  legend,
  thresholds,
}: ISQLChartSinglestatsProps) => {
  return (
    <Flex>
      {data.columns
        ?.filter((column) => yAxisColumns.includes(column))
        .map((column) => (
          <Flex
            key={column}
            flex={{ default: 'flex_1' }}
            direction={{ default: 'column' }}
            alignSelf={{ default: 'alignSelfStretch' }}
          >
            {yAxisColumns.length === 1 ? null : (
              <FlexItem className="pf-u-font-weight-bold" style={{ marginBottom: '0px' }}>
                {legend && column in legend ? legend[column] : column}
              </FlexItem>
            )}
            {data.rows?.map((row, index) => (
              <FlexItem
                key={index}
                style={{ backgroundColor: getBackgroundColor(column in row ? row[column] : '', thresholds) }}
              >
                <div
                  className="pf-u-text-align-center"
                  style={{
                    fontSize: '24px',
                    height: yAxisColumns.length === 1 ? '86px' : '65px',
                    paddingTop: yAxisColumns.length === 1 ? '31px' : '20px',
                  }}
                >
                  {column in row ? row[column] : ''}
                  {yAxisUnit ? ` ${yAxisUnit}` : ''}
                </div>
              </FlexItem>
            ))}
          </Flex>
        ))}
    </Flex>
  );
};

export default SQLChartSinglestats;
