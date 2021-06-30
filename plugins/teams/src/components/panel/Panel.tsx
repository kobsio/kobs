import React from 'react';

import { IPluginPanelProps, PluginCard } from '@kobsio/plugin-core';
import Teams from './Teams';

export const Panel: React.FunctionComponent<IPluginPanelProps> = ({ title, description }: IPluginPanelProps) => {
  return (
    <PluginCard title={title} description={description} transparent={true}>
      <Teams />
    </PluginCard>
  );
};

export default Panel;
