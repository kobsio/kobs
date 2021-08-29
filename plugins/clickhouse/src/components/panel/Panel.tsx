import React, { memo } from 'react';

import { IPluginPanelProps, PluginOptionsMissing } from '@kobsio/plugin-core';
import { IPanelOptions } from '../../utils/interfaces';
import Logs from './Logs';
import SQL from './SQL';

interface IPanelProps extends IPluginPanelProps {
  options?: IPanelOptions;
}

export const Panel: React.FunctionComponent<IPanelProps> = ({
  name,
  title,
  description,
  times,
  options,
  showDetails,
}: IPanelProps) => {
  if (
    !options ||
    !times ||
    (options.type === 'logs' &&
      (!options.queries || !Array.isArray(options.queries) || options.queries.length === 0)) ||
    (options.type === 'sql' && (!options.queries || !Array.isArray(options.queries) || options.queries.length === 0))
  ) {
    return (
      <PluginOptionsMissing
        title={title}
        message="Options for ClickHouse panel are missing or invalid"
        details="The panel doesn't contain the required options to render get the ClickHouse data or the provided options are invalid."
        documentation="https://kobs.io/plugins/elasticsearch"
      />
    );
  }

  if (options.type === 'logs' && options.queries) {
    return (
      <Logs
        name={name}
        title={title}
        description={description}
        queries={options.queries}
        times={times}
        showDetails={showDetails}
      />
    );
  }

  if (options.type === 'sql' && options.queries) {
    return <SQL name={name} title={title} description={description} queries={options.queries} />;
  }

  return null;
};

export default memo(Panel, (prevProps, nextProps) => {
  if (JSON.stringify(prevProps) === JSON.stringify(nextProps)) {
    return true;
  }

  return false;
});
