import React, { memo } from 'react';

import { IPluginPanelProps, PluginOptionsMissing } from '@kobsio/plugin-core';
import { IPanelOptions } from '../../utils/interfaces';
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
}: IPanelProps) => {
  if (!options || !options.type) {
    return (
      <PluginOptionsMissing
        title={title}
        message="Options for SQL panel are missing or invalid"
        details="The panel doesn't contain the required options to render get the SQL data or the provided options are invalid."
        documentation="https://kobs.io/plugins/sql"
      />
    );
  }

  if (options.type === 'table' && options.queries) {
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
