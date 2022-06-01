import React from 'react';

import { IPluginPanelProps, PluginPanelError } from '@kobsio/shared';
import { IPanelOptions } from '../../utils/interfaces';
import SQL from './SQL';
import SQLChart from './SQLChart';

interface ISQLPluginPanelProps extends IPluginPanelProps {
  options?: IPanelOptions;
}

const Panel: React.FunctionComponent<ISQLPluginPanelProps> = ({
  title,
  description,
  options,
  instance,
  setDetails,
}: ISQLPluginPanelProps) => {
  if (options && options.type === 'table' && options.queries) {
    return <SQL instance={instance} title={title} description={description} queries={options.queries} />;
  }

  if (options && options.type === 'chart' && options.chart && options.chart.type && options.chart.query) {
    return (
      <SQLChart
        instance={instance}
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
    <PluginPanelError
      title={title}
      description={description}
      message="Options for SQL panel are missing or invalid"
      details="The panel doesn't contain the required options to get data from the SQL database."
      documentation="https://kobs.io/main/plugins/sql"
    />
  );
};

export default Panel;
