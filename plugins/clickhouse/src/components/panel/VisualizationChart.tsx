import React from 'react';

import { IVisualizationData } from '../../utils/interfaces';
import VisualizationChartBar from './VisualizationChartBar';
import VisualizationChartPie from './VisualizationChartPie';

interface IVisualizationChartProps {
  chart: string;
  operation: string;
  data: IVisualizationData[];
}

const VisualizationChart: React.FunctionComponent<IVisualizationChartProps> = ({
  chart,
  operation,
  data,
}: IVisualizationChartProps) => {
  if (chart === 'bar') {
    return <VisualizationChartBar operation={operation} data={data} />;
  } else if (chart === 'pie') {
    return <VisualizationChartPie operation={operation} data={data} />;
  } else {
    return null;
  }
};

export default VisualizationChart;
