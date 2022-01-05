import React, { memo } from 'react';

import { IPluginPanelProps, PluginCard, PluginOptionsMissing } from '@kobsio/plugin-core';
import { IPanelOptions } from '../../utils/interfaces';
import Users from './Users';

interface IPanelProps extends IPluginPanelProps {
  options?: IPanelOptions;
}

export const Panel: React.FunctionComponent<IPanelProps> = ({ title, description, options }: IPanelProps) => {
  if (!options || !options.cluster || !options.namespace || !options.name) {
    return (
      <PluginOptionsMissing
        title={title}
        message="Options for Users panel are missing or invalid"
        details="The panel doesn't contain the required options to render get the Users data or the provided options are invalid."
        documentation="https://kobs.io/plugins/users"
      />
    );
  }

  return (
    <PluginCard title={title} description={description} transparent={true}>
      <Users cluster={options.cluster} namespace={options.namespace} name={options.name} />
    </PluginCard>
  );
};

export default memo(Panel, (prevProps, nextProps) => {
  if (JSON.stringify(prevProps) === JSON.stringify(nextProps)) {
    return true;
  }

  return false;
});
