import React from 'react';

import { IVisualizationData } from '../../utils/interfaces';
import VisualizationChartBar from './VisualizationChartBar';
import VisualizationChartPie from './VisualizationChartPie';

interface IVisualizationChartProps {
  chart: string;
  data: IVisualizationData[];
}

const VisualizationChart: React.FunctionComponent<IVisualizationChartProps> = ({
  chart,
  data,
}: IVisualizationChartProps) => {
  if (chart === 'bar') {
    return <VisualizationChartBar data={data} />;
  } else if (chart === 'pie') {
    return <VisualizationChartPie data={data} />;
  } else {
    return null;
  }
};

export default VisualizationChart;
