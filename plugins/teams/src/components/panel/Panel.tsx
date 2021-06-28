import React from 'react';

import { IPluginPanelProps, PluginCard } from '@kobsio/plugin-core';
import Teams from './Teams';

export const Panel: React.FunctionComponent<IPluginPanelProps> = ({ title }: IPluginPanelProps) => {
  return (
    <PluginCard title={title}>
      <Teams />
    </PluginCard>
  );
};

export default Panel;
