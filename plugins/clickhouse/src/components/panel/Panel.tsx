import React, { memo } from 'react';

import { IPluginPanelProps, PluginOptionsMissing } from '@kobsio/plugin-core';
import { IPanelOptions } from '../../utils/interfaces';
import Logs from './Logs';

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
  if (!options || !times || !options.type) {
    return (
      <PluginOptionsMissing
        title={title}
        message="Options for ClickHouse panel are missing or invalid"
        details="The panel doesn't contain the required options to render get the ClickHouse data or the provided options are invalid."
        documentation="https://kobs.io/plugins/clickhouse"
      />
    );
  }

  if (options.type === 'logs' && options.queries) {
    return <Logs name={name} title={title} description={description} queries={options.queries} times={times} />;
  }

  return null;
};

export default memo(Panel, (prevProps, nextProps) => {
  if (JSON.stringify(prevProps) === JSON.stringify(nextProps)) {
    return true;
  }

  return false;
});
