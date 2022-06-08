import { IPluginInstance, PluginInstance } from '@kobsio/shared';
import React from 'react';
import icon from '../../assets/icon.png';

import { defaultDescription } from '../../utils/constants';

const Instance: React.FunctionComponent<IPluginInstance> = ({
  satellite,
  name,
  type,
  description,
}: IPluginInstance) => {
  return (
    <PluginInstance
      satellite={satellite}
      name={name}
      type={type}
      description={description || defaultDescription}
      icon={icon}
    />
  );
};

export default Instance;
