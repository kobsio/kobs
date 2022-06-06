import React from 'react';

import { IPluginPanelProps, PluginPanelError } from '@kobsio/shared';
import { IPanelOptions } from '../../utils/interfaces';
import LogsWrapper from './LogsWrapper';

interface IElasticsearchPluginPanelProps extends IPluginPanelProps {
  options?: IPanelOptions;
}

const Panel: React.FunctionComponent<IElasticsearchPluginPanelProps> = ({
  title,
  description,
  options,
  instance,
  times,
  setDetails,
}: IElasticsearchPluginPanelProps) => {
  if (options && options.queries && Array.isArray(options.queries) && options.queries.length > 0 && times) {
    return (
      <LogsWrapper
        instance={instance}
        title={title}
        description={description}
        queries={options.queries}
        showChart={options.showChart || false}
        times={times}
      />
    );
  }

  return (
    <PluginPanelError
      title={title}
      description={description}
      message="Options for Elasticsearch panel are missing or invalid"
      details="The panel doesn't contain the required options to get data from Elasticsearch."
      documentation="https://kobs.io/main/plugins/elasticsearch"
    />
  );
};

export default Panel;
