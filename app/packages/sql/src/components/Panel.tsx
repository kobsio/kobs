import { IPluginPanelProps, isString, PluginPanelError } from '@kobsio/core';
import { FunctionComponent } from 'react';

import PanelChartView from './PanelChartView';
import PanelTableView from './PanelTableView';
import { IChart, IChartPanelOptions, IQuery, ITablePanelOptions } from './types';

/**
 * runtime check for validating the queries object
 */
const isValidQueries = (queries: unknown): queries is IQuery[] => {
  if (!queries) {
    return false;
  }

  if (!Array.isArray(queries)) {
    return false;
  }

  for (const query of queries) {
    if (!query.hasOwnProperty('query')) {
      return false;
    }

    if (!isString(query.query)) {
      return false;
    }
  }

  return true;
};

/**
 * runtime check for validating the chart object
 */
const isValidChart = (chart: unknown): chart is IChart => {
  return false;
};

const Panel: FunctionComponent<IPluginPanelProps<ITablePanelOptions | IChartPanelOptions>> = ({
  title,
  description,
  options,
  instance,
}) => {
  if (!options) {
    return (
      <PluginPanelError
        description={description}
        details={`The panel configuration must include a property with name "options"`}
        documentation=""
        message="Options for SQL panel are missing"
        title={title}
      />
    );
  }

  if (options.type === 'table') {
    if (!isValidQueries(options.queries)) {
      return (
        <PluginPanelError
          description={description}
          details={`The validation for the "queries" property failed.`}
          documentation=""
          example={`queries:
  - name: my sql query
    columns:
      id: Identifier
      quantity: Quantity
      price: Product Price
    query: "SELECT id, quantity, price FROM orders`}
          message={`Please provide a valid "queries" property.`}
          title={title}
        />
      );
    }
    return <PanelTableView description={description} instance={instance} queries={options.queries} title={title} />;
  }

  if (options.type === 'chart') {
    if (!isValidChart(options.chart)) {
      return (
        <PluginPanelError
          description={description}
          details={`The validation for the "chart" property failed.`}
          documentation=""
          example={`TODO`}
          message={`Please provide a valid "chart" property.`}
          title={title}
        />
      );
    }
    return <PanelChartView chart={options.chart} description={description} instance={instance} title={title} />;
  }

  return (
    <PluginPanelError
      description={description}
      details={`The type must either be "table" or "chart"`}
      documentation=""
      message={`Unknown "type" in configuration`}
      title={title}
    />
  );
};

export default Panel;
