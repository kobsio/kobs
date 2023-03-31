import { IPluginInstance } from '@kobsio/core';
import { FunctionComponent } from 'react';

import { IChart } from './types';

interface IPanelChartViewProps {
  chart: IChart;
  description?: string;
  instance: IPluginInstance;
  title: string;
}

const PanelChartView: FunctionComponent<IPanelChartViewProps> = ({ chart, description, instance, title }) => {
  return <>TODO</>;
};

export default PanelChartView;
