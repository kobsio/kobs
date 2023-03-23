import { IPluginPanelProps } from '@kobsio/core';
import { Alert } from '@mui/material';
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

  return <Alert severity="warning">The type property of the panel options must either be logs or aggregation.</Alert>;
};

export default Panel;
