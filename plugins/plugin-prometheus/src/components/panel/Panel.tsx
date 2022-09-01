import React from 'react';

import { IPluginPanelProps, PluginPanelError } from '@kobsio/shared';
import { IPanelOptions } from '../../utils/interfaces';
import PanelChart from './PanelChart';
import Table from './Table';

interface IPrometheusPluginPanelProps extends IPluginPanelProps {
  options?: IPanelOptions;
}

const Panel: React.FunctionComponent<IPrometheusPluginPanelProps> = ({
  title,
  description,
  options,
  instance,
  times,
}: IPrometheusPluginPanelProps) => {
  if (options && times) {
    if (options.type === 'table') {
      return <Table instance={instance} title={title} description={description} times={times} options={options} />;
    } else {
      return <PanelChart instance={instance} title={title} description={description} times={times} options={options} />;
    }
  }

  return (
    <PluginPanelError
      title={title}
      description={description}
      message="Options for Prometheus panel are missing or invalid"
      details="The panel doesn't contain the required options to render the Prometheus chart or the provided options are invalid."
      documentation="https://kobs.io/main/plugins/prometheus"
    />
  );
};

export default Panel;
