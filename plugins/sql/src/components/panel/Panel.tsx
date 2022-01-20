import React, { memo } from 'react';

import { IPluginPanelProps, PluginOptionsMissing } from '@kobsio/plugin-core';
import { IPanelOptions } from '../../utils/interfaces';
import SQL from './SQL';
import SQLChart from './SQLChart';

interface IPanelProps extends IPluginPanelProps {
  options?: IPanelOptions;
}

export const Panel: React.FunctionComponent<IPanelProps> = ({
  name,
  title,
  description,
  times,
  options,
}: IPanelProps) => {
  if (options && options.type === 'table' && options.queries) {
    return <SQL name={name} title={title} description={description} queries={options.queries} />;
  }

  if (options && options.type === 'chart' && options.chart && options.chart.type && options.chart.query) {
    return (
      <SQLChart
        name={name}
        title={title}
        description={description}
        type={options.chart.type}
        query={options.chart.query}
        pieLabelColumn={options.chart.pieLabelColumn}
        pieValueColumn={options.chart.pieValueColumn}
        xAxisColumn={options.chart.xAxisColumn}
        xAxisType={options.chart.xAxisType}
        xAxisUnit={options.chart.xAxisUnit}
        yAxisColumns={options.chart.yAxisColumns}
        yAxisUnit={options.chart.yAxisUnit}
        yAxisStacked={options.chart.yAxisStacked}
        legend={options.chart.legend}
      />
    );
  }

  return (
    <PluginOptionsMissing
      title={title}
      message="Options for SQL panel are missing or invalid"
      details="The panel doesn't contain the required options to render get the SQL data or the provided options are invalid."
      documentation="https://kobs.io/plugins/sql"
    />
  );
};

export default memo(Panel, (prevProps, nextProps) => {
  if (JSON.stringify(prevProps) === JSON.stringify(nextProps)) {
    return true;
  }

  return false;
});
