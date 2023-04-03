import { IPluginPanelProps, PluginPanelError } from '@kobsio/core';
import { FunctionComponent } from 'react';

import AggregationPanel, { IOptions as IAggregationPanelOptions } from './AggregationPanel';
import LogsPanel, { IOptions as ILogsPanelOptions } from './LogsPanel';

/**
 * Panel implements the panel for the klogs plugin
 * a panel can either render a table view for logs
 * or a chart depending on the property options.type
 */
const Panel: FunctionComponent<IPluginPanelProps<ILogsPanelOptions | IAggregationPanelOptions>> = (props) => {
  if (props.options?.type === 'logs') {
    return (
      <LogsPanel
        options={props.options}
        instance={props.instance}
        times={props.times}
        title={props.title}
        setTimes={props.setTimes}
      />
    );
  }

  if (props.options?.type === 'aggregation') {
    return (
      <AggregationPanel
        options={props.options}
        instance={props.instance}
        title={props.title}
        times={props.times}
        setTimes={props.setTimes}
      />
    );
  }

  return (
    <PluginPanelError
      title={props.title}
      description={props.description}
      message="Incorrect configuration for panel options"
      details="The type property of the panel options must either be logs or aggregation"
      documentation="https://kobs.io/main/plugins/klogs/#panel-options"
    />
  );
};

export default Panel;
