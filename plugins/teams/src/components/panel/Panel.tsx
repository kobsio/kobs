import React, { memo } from 'react';

import { IPluginPanelProps, PluginCard } from '@kobsio/plugin-core';
import Teams from './Teams';

// The Panel component implements the panel component for the teams plugin. The plugin doesn't require any options,
// because it can only be used to display all teams from all clusters and namespaces.
export const Panel: React.FunctionComponent<IPluginPanelProps> = ({ title, description }: IPluginPanelProps) => {
  return (
    <PluginCard title={title} description={description}>
      <Teams />
    </PluginCard>
  );
};

export default memo(Panel, (prevProps, nextProps) => {
  if (prevProps.title === nextProps.title && prevProps.description === nextProps.description) {
    return true;
  }

  return false;
});
