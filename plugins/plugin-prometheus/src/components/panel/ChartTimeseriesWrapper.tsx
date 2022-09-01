import React, { useState } from 'react';

import { ITimes, getColor } from '@kobsio/shared';
import ChartTimeseries from './ChartTimeseries';
import ChartTimeseriesLegend from './ChartTimeseriesLegend';
import { IMetric } from '../../utils/interfaces';

interface IChartTimeseriesWrapperProps {
  metrics: IMetric[];
  type: 'line' | 'area' | 'bar';
  stacked: boolean;
  unit?: string;
  min?: number;
  max?: number;
  legend?: string;
  times: ITimes;
}

export const ChartTimeseriesWrapper: React.FunctionComponent<IChartTimeseriesWrapperProps> = ({
  metrics,
  type,
  stacked,
  unit,
  min,
  max,
  legend,
  times,
}: IChartTimeseriesWrapperProps) => {
  const [selectedMetric, setSelectedMetric] = useState<number>(-1);

  const select = (index: number): void => {
    if (selectedMetric === index) {
      setSelectedMetric(-1);
    } else {
      setSelectedMetric(index);
    }
  };

  return (
    <React.Fragment>
      <div
        style={{
          height: legend === 'table' ? 'calc(100% - 80px)' : legend === 'table-large' ? 'calc(100% - 140px)' : '100%',
        }}
      >
        <ChartTimeseries
          metrics={selectedMetric === -1 ? metrics : [metrics[selectedMetric]]}
          type={type === 'line' || type === 'area' ? type : 'line'}
          stacked={stacked ? true : false}
          unit={unit}
          min={min}
          max={max}
          color={selectedMetric === -1 ? undefined : getColor(selectedMetric)}
          times={times}
        />
      </div>
      {legend === 'table' ? (
        <div className="pf-u-mt-md kobsio-hide-scrollbar" style={{ height: '60px', overflow: 'auto' }}>
          <ChartTimeseriesLegend metrics={metrics} unit={unit || ''} selected={selectedMetric} select={select} />
        </div>
      ) : legend === 'table-large' ? (
        <div className="pf-u-mt-md kobsio-hide-scrollbar" style={{ height: '120px', overflow: 'auto' }}>
          <ChartTimeseriesLegend metrics={metrics} unit={unit || ''} selected={selectedMetric} select={select} />
        </div>
      ) : null}
    </React.Fragment>
  );
};

export default ChartTimeseriesWrapper;
